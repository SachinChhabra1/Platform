/// Who a phone belongs to — the minimum a phone-first re-proof needs.
///
/// Resolving a phone to a Member is the *verification* step of session issuance.
/// Its real strength (one-time codes, SIM checks, Book VIII §1.3) is not yet
/// Engineering-Locked; this port is the seam where that lands. For the prototype
/// the adapter is a seeded phone → membership-id map, so the number is matched
/// server-side and an unrecognised number is never issued a session (spec 0002
/// security boundary 2: the number alone is necessary, not sufficient).

export interface MemberDirectory {
  /** The membership id a phone belongs to, or `undefined` if unrecognised. */
  resolvePhone(phone: string): string | undefined;
}

/** In-memory [MemberDirectory] for the prototype/dev: a fixed phone → id map. */
export class InMemoryMemberDirectory implements MemberDirectory {
  private readonly byPhone: ReadonlyMap<string, string>;

  constructor(byPhone: Readonly<Record<string, string>>) {
    this.byPhone = new Map(Object.entries(byPhone));
  }

  resolvePhone(phone: string): string | undefined {
    return this.byPhone.get(phone);
  }
}
