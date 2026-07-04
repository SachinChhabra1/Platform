/// Savings withdrawal mechanics — the domain for "their money, their yield,
/// available on demand" (R7; ruling: ADR-0016 / OD-5, Option B, locked in
/// /ENGINEERING_LOCK.md).
///
/// Four locked rules:
///  1. On withdrawal the amount is IMMEDIATELY available in the Wallet.
///  2. Actual rail SETTLEMENT is T+n (disclosed) — available → settled.
///  3. INTEREST accrues to the Member, net of a single disclosed fee if any.
///  4. NO early-withdrawal penalty on the default product.
///
/// What ADR-0016 deliberately does NOT fix — and this file therefore does NOT
/// invent — is the concrete interest RATE / accrual FORMULA and the settlement
/// horizon `n`. Those are Founder-owned config: the rate/formula/fee come through
/// the `InterestAccrualPolicy` SEAM (like the dignity floor's `FloorSource`), and
/// `n` is supplied per-withdrawal by the caller's config. The default seam
/// (`NoInterestAccrualPolicy`) yields zero until the Founder supplies the pricing
/// input — honest emptiness, never a fabricated rate. Amounts are integer paise
/// (`money.ts`).
///
/// NOTE (bounded context): co-located in the wallet money domain (the offline dev
/// sandbox cannot add a new pnpm workspace member). Extract to `services/savings`
/// (ADR-0004) when online. Deposits land here from the wage waterfall's `savings`
/// step (ADR-0012); the Member-facing surface is read + withdraw.

function assertPaise(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer paise value, got ${value}`);
  }
}

// --- The savings account --------------------------------------------------

export interface SavingsAccount {
  readonly id: string;
  readonly membershipId: string;
  /** Deposited principal net of withdrawn principal, in integer paise. */
  readonly principalPaise: number;
  /** The Member's yield so far, already NET of the disclosed fee, in integer paise. */
  readonly netInterestPaise: number;
  /** Cumulative disclosed fee netted from interest — carried for transparency, not part of the balance. */
  readonly feePaise: number;
  /**
   * The default product is unlocked (no penalty). A locked-term product is NOT
   * part of this ruling (rejected Option C); a locked account refuses withdrawal
   * rather than penalising it.
   */
  readonly locked: boolean;
  readonly openedAt: string;
  /** Up to when interest has been accrued; the next accrual runs from here. */
  readonly lastAccruedAt: string;
}

export interface OpenAccountInput {
  readonly id: string;
  readonly membershipId: string;
  readonly now: Date;
  /** Optional opening principal (e.g. a first wage `savings` deposit). Defaults to 0. */
  readonly openingPrincipalPaise?: number;
  /** Defaults to false — the default savings product is unlocked. */
  readonly locked?: boolean;
}

export function openAccount(input: OpenAccountInput): SavingsAccount {
  const opening = input.openingPrincipalPaise ?? 0;
  assertPaise('openingPrincipalPaise', opening);
  const at = input.now.toISOString();
  return {
    id: input.id,
    membershipId: input.membershipId,
    principalPaise: opening,
    netInterestPaise: 0,
    feePaise: 0,
    locked: input.locked ?? false,
    openedAt: at,
    lastAccruedAt: at,
  };
}

/** The withdrawable balance: principal + net interest (the yield is theirs). */
export function balancePaise(account: SavingsAccount): number {
  return account.principalPaise + account.netInterestPaise;
}

/** Deposit into savings (e.g. the wage waterfall's `savings` step). Principal up. */
export function deposit(account: SavingsAccount, amountPaise: number): SavingsAccount {
  assertPaise('amountPaise', amountPaise);
  return { ...account, principalPaise: account.principalPaise + amountPaise };
}

// --- Interest accrual (the seam) ------------------------------------------

/// The interest a Member earns over a period. The RATE, day-count, compounding
/// and fee model live behind this port (Founder-owned pricing), NOT in the domain
/// — so the ownership rule (yield to the Member, net of a disclosed fee) is
/// enforced here without fabricating a rate. `gross` is the interest earned;
/// `fee` (0 ≤ fee ≤ gross) is the single disclosed fee netted from it.
export interface InterestAccrualPolicy {
  accrue(
    principalPaise: number,
    from: Date,
    to: Date,
  ): { readonly grossPaise: number; readonly feePaise: number };
}

/// The honest default until the Founder supplies the pricing config: no interest,
/// no fee. Mirrors `InMemoryFloorSource` — a seam placeholder, not a policy.
export class NoInterestAccrualPolicy implements InterestAccrualPolicy {
  accrue(): { readonly grossPaise: number; readonly feePaise: number } {
    return { grossPaise: 0, feePaise: 0 };
  }
}

/// Accrue interest on the account up to `asOf` via the injected policy. Adds the
/// net (gross − fee) to the Member's yield and carries the fee for disclosure.
/// Pure and idempotent-forward: accruing again to the same instant adds nothing.
export function accrueInterest(
  account: SavingsAccount,
  policy: InterestAccrualPolicy,
  asOf: Date,
): SavingsAccount {
  const from = new Date(account.lastAccruedAt);
  if (asOf.getTime() <= from.getTime()) return account;
  const { grossPaise, feePaise } = policy.accrue(account.principalPaise, from, asOf);
  assertPaise('grossPaise', grossPaise);
  assertPaise('feePaise', feePaise);
  if (feePaise > grossPaise) {
    // A fee exceeding the interest would turn the yield negative — that is a
    // penalty by another name, which the ruling forbids.
    throw new RangeError(`disclosed fee ${feePaise} cannot exceed gross interest ${grossPaise}`);
  }
  return {
    ...account,
    netInterestPaise: account.netInterestPaise + (grossPaise - feePaise),
    feePaise: account.feePaise + feePaise,
    lastAccruedAt: asOf.toISOString(),
  };
}

// --- The withdrawal -------------------------------------------------------

export type WithdrawalState = 'requested' | 'available' | 'settled';
export type WithdrawalEventType = 'requested' | 'available' | 'settled';

export interface WithdrawalEvent {
  readonly type: WithdrawalEventType;
  readonly at: string;
}

export interface Withdrawal {
  readonly id: string;
  readonly accountId: string;
  readonly membershipId: string;
  readonly amountPaise: number;
  readonly state: WithdrawalState;
  readonly requestedAt: string;
  /** When the funds became usable in the Wallet — the same instant as the request. */
  readonly availableAt: string;
  /** When rail settlement is expected (requestedAt + n, disclosed). */
  readonly settleDueAt: string;
  readonly settledAt?: string | undefined;
  readonly history: readonly WithdrawalEvent[];
}

export interface RequestWithdrawalInput {
  readonly id: string;
  readonly amountPaise: number;
  readonly now: Date;
  /** The disclosed settlement horizon `n`, in milliseconds (Founder-owned config). */
  readonly settleAfterMs: number;
}

/// Request a withdrawal. The amount is drawn from the balance (net interest first,
/// then principal — the yield is the liquid part), the account is debited, and the
/// withdrawal is returned ALREADY `available` (immediate use in the Wallet) with
/// settlement due at T+n. No penalty: the available amount equals the requested
/// amount. Throws if the account is locked or the balance is insufficient — it
/// refuses, it does not penalise.
export function requestWithdrawal(
  account: SavingsAccount,
  input: RequestWithdrawalInput,
): { readonly account: SavingsAccount; readonly withdrawal: Withdrawal } {
  assertPaise('amountPaise', input.amountPaise);
  if (input.amountPaise < 1) {
    throw new RangeError('a withdrawal amount must be at least 1 paise');
  }
  if (!Number.isInteger(input.settleAfterMs) || input.settleAfterMs < 0) {
    throw new RangeError(`settleAfterMs must be a non-negative integer, got ${input.settleAfterMs}`);
  }
  if (account.locked) {
    throw new Error('cannot withdraw from a locked account (a locked-term product is not part of this ruling)');
  }
  const available = balancePaise(account);
  if (input.amountPaise > available) {
    throw new RangeError(`insufficient balance: requested ${input.amountPaise}, available ${available}`);
  }

  const fromInterest = Math.min(input.amountPaise, account.netInterestPaise);
  const fromPrincipal = input.amountPaise - fromInterest;
  const debited: SavingsAccount = {
    ...account,
    netInterestPaise: account.netInterestPaise - fromInterest,
    principalPaise: account.principalPaise - fromPrincipal,
  };

  const at = input.now.toISOString();
  const withdrawal: Withdrawal = {
    id: input.id,
    accountId: account.id,
    membershipId: account.membershipId,
    amountPaise: input.amountPaise,
    state: 'available',
    requestedAt: at,
    availableAt: at,
    settleDueAt: new Date(input.now.getTime() + input.settleAfterMs).toISOString(),
    history: [
      { type: 'requested', at },
      { type: 'available', at },
    ],
  };
  return { account: debited, withdrawal };
}

/// Settle a withdrawal once the rail clears (rail-driven, T+n — NOT a Member
/// action, same principle as remittance confirmation). Allowed only from
/// `available`; a settled withdrawal is unchanged (idempotent).
export function settleWithdrawal(withdrawal: Withdrawal, now: Date): Withdrawal {
  if (withdrawal.state === 'settled') return withdrawal;
  if (withdrawal.state !== 'available') {
    throw new Error(`cannot settle a withdrawal in state '${withdrawal.state}'`);
  }
  const at = now.toISOString();
  return {
    ...withdrawal,
    state: 'settled',
    settledAt: at,
    history: [...withdrawal.history, { type: 'settled', at }],
  };
}
