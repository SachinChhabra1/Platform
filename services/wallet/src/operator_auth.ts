/// Operator identity — the per-operator credential boundary (OD-8 / ADR-0019).
/// Resolving a money conflict is an authoritative, audited act, so "who resolved
/// it" must be a real operator identity — NOT the shared service token (which has
/// no identity) and NOT a Member session. An operator presents a per-operator
/// credential; it resolves to an `operatorId` recorded on the resolution.
///
/// Credentials are Founder/ops-owned, injected at composition (never invented).
/// An empty directory resolves NOTHING — default-deny until operators are
/// provisioned. This mirrors the Member `SessionStore` shape (a directory lookup),
/// kept separate because operators and Members are different principals.

/** The header an operator presents their credential in. */
export const OPERATOR_TOKEN_HEADER = 'x-nia-operator-token';

export interface OperatorIdentity {
  readonly operatorId: string;
}

export interface OperatorAuthenticator {
  /** Resolve a presented credential to an operator identity, or undefined (deny). */
  authenticate(credential: string | undefined): OperatorIdentity | undefined;
}

/// An in-memory operator directory: a `credential → operatorId` map seeded by the
/// composition root. The real store (per-operator secrets, rotation, revocation)
/// plugs in here later; the identity contract does not change.
export class InMemoryOperatorDirectory implements OperatorAuthenticator {
  readonly #byCredential: ReadonlyMap<string, string>;

  constructor(seed: Readonly<Record<string, string>> = {}) {
    this.#byCredential = new Map(Object.entries(seed).filter(([credential]) => credential.length > 0));
  }

  authenticate(credential: string | undefined): OperatorIdentity | undefined {
    if (!credential) return undefined;
    const operatorId = this.#byCredential.get(credential);
    return operatorId === undefined ? undefined : { operatorId };
  }
}
