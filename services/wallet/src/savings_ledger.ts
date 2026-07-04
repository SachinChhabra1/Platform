/// Persistence seams for Savings (R7; ADR-0016). Ports & adapters, like the other
/// stores: they RECORD and RETRIEVE — the policy lives in `savings.ts`. An account
/// is auditable by id and by Member (one default account per Member); withdrawals
/// are auditable by id and by Member. The real ledger-backed store plugs in here
/// later; rail settlement (available → settled) is driven through `WithdrawalStore`
/// by the rail adapter, not by the Member API.

import type { SavingsAccount, Withdrawal } from './savings.js';

export interface SavingsAccountStore {
  save(account: SavingsAccount): Promise<void>;
  get(id: string): Promise<SavingsAccount | undefined>;
  /** The Member's savings account (one default account per Member), if any. */
  getForMember(membershipId: string): Promise<SavingsAccount | undefined>;
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
}

export interface WithdrawalStore {
  save(withdrawal: Withdrawal): Promise<void>;
  get(id: string): Promise<Withdrawal | undefined>;
  listForMember(membershipId: string): Promise<readonly Withdrawal[]>;
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
}
