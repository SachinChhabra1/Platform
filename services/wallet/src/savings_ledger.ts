/// Persistence seams for Savings (R7; ADR-0016). Ports & adapters, like the other
/// stores: they RECORD and RETRIEVE — the policy lives in `savings.ts`. An account
/// is auditable by id and by Member (one default account per Member); withdrawals
/// are auditable by id and by Member. The real ledger-backed store plugs in here
/// later; rail settlement (available → settled) is driven through `WithdrawalStore`
/// by the rail adapter, not by the Member API.

import {
  accrueInterest,
  settleWithdrawal,
  type InterestAccrualPolicy,
  type SavingsAccount,
  type Withdrawal,
} from './savings.js';
import { InMemoryDurableStore, type DurableStore } from './durable_store.js';

export interface SavingsAccountStore {
  save(account: SavingsAccount): Promise<void>;
  get(id: string): Promise<SavingsAccount | undefined>;
  /** The Member's savings account (one default account per Member), if any. */
  getForMember(membershipId: string): Promise<SavingsAccount | undefined>;
  /** Every account — the accrual job iterates these. */
  listAll(): Promise<readonly SavingsAccount[]>;
}

export class InMemorySavingsAccountStore implements SavingsAccountStore {
  readonly #byId = new Map<string, SavingsAccount>();

  async save(account: SavingsAccount): Promise<void> {
    this.#byId.set(account.id, account);
  }

  async get(id: string): Promise<SavingsAccount | undefined> {
    return this.#byId.get(id);
  }

  async getForMember(membershipId: string): Promise<SavingsAccount | undefined> {
    return [...this.#byId.values()].find((a) => a.membershipId === membershipId);
  }

  async listAll(): Promise<readonly SavingsAccount[]> {
    return [...this.#byId.values()];
  }
}

export interface WithdrawalStore {
  save(withdrawal: Withdrawal): Promise<void>;
  get(id: string): Promise<Withdrawal | undefined>;
  listForMember(membershipId: string): Promise<readonly Withdrawal[]>;
  /** Withdrawals `available` and past their T+n settlement time — the settlement job's work. */
  listDueForSettlement(now: Date): Promise<readonly Withdrawal[]>;
}

export class InMemoryWithdrawalStore implements WithdrawalStore {
  readonly #byId = new Map<string, Withdrawal>();

  async save(withdrawal: Withdrawal): Promise<void> {
    this.#byId.set(withdrawal.id, withdrawal);
  }

  async get(id: string): Promise<Withdrawal | undefined> {
    return this.#byId.get(id);
  }

  async listForMember(membershipId: string): Promise<readonly Withdrawal[]> {
    return [...this.#byId.values()].filter((w) => w.membershipId === membershipId);
  }

  async listDueForSettlement(now: Date): Promise<readonly Withdrawal[]> {
    return [...this.#byId.values()].filter(
      (w) => w.state === 'available' && Date.parse(w.settleDueAt) <= now.getTime(),
    );
  }
}

/// Durable `SavingsAccountStore` over any `DurableStore<SavingsAccount>` (file or
/// Postgres). Same port; the accrual job and Member API are unaffected.
export class DurableSavingsAccountStore implements SavingsAccountStore {
  readonly #backing: DurableStore<SavingsAccount>;
  constructor(backing: DurableStore<SavingsAccount> = new InMemoryDurableStore<SavingsAccount>()) {
    this.#backing = backing;
  }
  async save(account: SavingsAccount): Promise<void> {
    await this.#backing.put(account.id, account);
  }
  async get(id: string): Promise<SavingsAccount | undefined> {
    return this.#backing.get(id);
  }
  async getForMember(membershipId: string): Promise<SavingsAccount | undefined> {
    return (await this.#backing.values()).find((a) => a.membershipId === membershipId);
  }
  async listAll(): Promise<readonly SavingsAccount[]> {
    return this.#backing.values();
  }
}

/// Durable `WithdrawalStore` over any `DurableStore<Withdrawal>`.
export class DurableWithdrawalStore implements WithdrawalStore {
  readonly #backing: DurableStore<Withdrawal>;
  constructor(backing: DurableStore<Withdrawal> = new InMemoryDurableStore<Withdrawal>()) {
    this.#backing = backing;
  }
  async save(withdrawal: Withdrawal): Promise<void> {
    await this.#backing.put(withdrawal.id, withdrawal);
  }
  async get(id: string): Promise<Withdrawal | undefined> {
    return this.#backing.get(id);
  }
  async listForMember(membershipId: string): Promise<readonly Withdrawal[]> {
    return (await this.#backing.values()).filter((w) => w.membershipId === membershipId);
  }
  async listDueForSettlement(now: Date): Promise<readonly Withdrawal[]> {
    return (await this.#backing.values()).filter(
      (w) => w.state === 'available' && Date.parse(w.settleDueAt) <= now.getTime(),
    );
  }
}

// --- Scheduled savings jobs (R7 infra) ------------------------------------

export interface AccrualJobResult {
  /** How many accounts were examined. */
  readonly scanned: number;
  /** How many accounts had interest accrued (a positive advance in their yield). */
  readonly accrued: number;
}

/// The interest-accrual job (ADR-0016): accrue interest on every account up to
/// `now` via the injected Founder-owned policy. Idempotent per instant —
/// `accrueInterest` is a no-op when `now` is not after an account's last accrual,
/// so running the job repeatedly never double-counts. The rate/formula lives in
/// the policy seam; this job invents nothing.
export async function accrueAllSavings(
  now: Date,
  deps: { readonly accounts: SavingsAccountStore; readonly policy: InterestAccrualPolicy },
): Promise<AccrualJobResult> {
  const all = await deps.accounts.listAll();
  let accrued = 0;
  for (const account of all) {
    const next = accrueInterest(account, deps.policy, now);
    if (next !== account) {
      await deps.accounts.save(next);
      accrued += 1;
    }
  }
  return { scanned: all.length, accrued };
}

export interface SettlementJobResult {
  /** The withdrawal ids moved available → settled this run. */
  readonly settled: readonly string[];
}

/// The withdrawal-settlement job (ADR-0016): move every `available` withdrawal
/// whose T+n settlement time has passed to `settled`. Rail-driven timing, run off
/// a schedule; idempotent (a settled withdrawal is no longer due). The Member
/// already had the cash on withdrawal — this only clears the rail leg.
export async function settleDueWithdrawals(
  now: Date,
  deps: { readonly withdrawals: WithdrawalStore },
): Promise<SettlementJobResult> {
  const due = await deps.withdrawals.listDueForSettlement(now);
  const settled: string[] = [];
  for (const withdrawal of due) {
    const next = settleWithdrawal(withdrawal, now);
    await deps.withdrawals.save(next);
    settled.push(next.id);
  }
  return { settled };
}
