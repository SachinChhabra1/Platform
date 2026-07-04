/// Persistence seams for RafiQi (R5; ADR-0014). Ports & adapters, like the other
/// stores: they RECORD and RETRIEVE — the policy lives in `rafiqi.ts`. Grants and
/// actions are auditable by id and by Member; "every grant and use logged" (the
/// append-only action history + these stores) is the audit trail. The real
/// append-only ledger plugs in here later.

import { isGrantActive, type AuthorizationGrant, type RafiqiAction } from './rafiqi.js';

export interface GrantStore {
  save(grant: AuthorizationGrant): Promise<void>;
  get(id: string): Promise<AuthorizationGrant | undefined>;
  /** All of a Member's grants (revoked/expired included — audit needs history). */
  listForMember(membershipId: string): Promise<readonly AuthorizationGrant[]>;
  /** The Member's currently-active grants, for the authorisation decision. */
  listActiveForMember(membershipId: string, now: Date): Promise<readonly AuthorizationGrant[]>;
}

export class InMemoryGrantStore implements GrantStore {
  readonly #byId = new Map<string, AuthorizationGrant>();

  async save(grant: AuthorizationGrant): Promise<void> {
    this.#byId.set(grant.id, grant);
  }

  async get(id: string): Promise<AuthorizationGrant | undefined> {
    return this.#byId.get(id);
  }

  async listForMember(membershipId: string): Promise<readonly AuthorizationGrant[]> {
    return [...this.#byId.values()].filter((g) => g.membershipId === membershipId);
  }

  async listActiveForMember(membershipId: string, now: Date): Promise<readonly AuthorizationGrant[]> {
    return [...this.#byId.values()].filter((g) => g.membershipId === membershipId && isGrantActive(g, now));
  }
}

export interface RafiqiActionStore {
  save(action: RafiqiAction): Promise<void>;
  get(id: string): Promise<RafiqiAction | undefined>;
  listForMember(membershipId: string): Promise<readonly RafiqiAction[]>;
}

export class InMemoryRafiqiActionStore implements RafiqiActionStore {
  readonly #byId = new Map<string, RafiqiAction>();

  async save(action: RafiqiAction): Promise<void> {
    this.#byId.set(action.id, action);
  }

  async get(id: string): Promise<RafiqiAction | undefined> {
    return this.#byId.get(id);
  }

  async listForMember(membershipId: string): Promise<readonly RafiqiAction[]> {
    return [...this.#byId.values()].filter((a) => a.membershipId === membershipId);
  }
}
