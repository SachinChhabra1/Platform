/// Read-only source of a Member's assembled wallet activity (ports & adapters,
/// as in services/membership). The Overview reads; it never writes. The real
/// adapter will project from the append-only ledger (a later, senior-reviewed
/// slice); this in-memory adapter serves tests and the not-yet-persistent read
/// path.

import type { WalletActivity } from './activity.js';

export interface WalletActivitySource {
  /** The Member's assembled activity log, to be projected by the Overview. Read-only. */
  listForMember(membershipId: string): Promise<readonly WalletActivity[]>;
}

export class InMemoryWalletActivitySource implements WalletActivitySource {
  readonly #byMember: Map<string, readonly WalletActivity[]>;

  constructor(byMember: Record<string, readonly WalletActivity[]> = {}) {
    this.#byMember = new Map(Object.entries(byMember));
  }

  async listForMember(
    membershipId: string,
  ): Promise<readonly WalletActivity[]> {
    return this.#byMember.get(membershipId) ?? [];
  }
}
