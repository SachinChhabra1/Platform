/// Who a phone belongs to — the minimum a phone-first session re-proof needs
/// (spec 0002; verification seam). Resolving a phone to a Member is the
/// *verification* step of issuance; its real strength (one-time codes, SIM checks,
/// Book VIII §1.3) is not yet Engineering-Locked — this port is where that lands.
/// For UAT the adapter is a provisioned phone → membership-id map (from config), so
/// an unrecognised number is never issued a session (security boundary 2: the
/// number alone is necessary, not sufficient).
///
/// Co-located in the wallet service so login can be composed into the single UAT
/// process (the sync `SessionStore` cannot be shared cross-process). It mirrors
/// `@nia/sessions`' `MemberDirectory`; consolidate onto that package when the
/// offline workspace can grow a member (same pattern as the co-located money domains).

export interface MemberDirectory {
  /** The membership id a phone belongs to, or `undefined` if unrecognised. */
  resolvePhone(phone: string): string | undefined;
}

/** In-memory [MemberDirectory]: a fixed phone → membership-id map (provisioned). */
export class InMemoryMemberDirectory implements MemberDirectory {
  readonly #byPhone: ReadonlyMap<string, string>;

  constructor(byPhone: Readonly<Record<string, string>>) {
    this.#byPhone = new Map(Object.entries(byPhone));
  }

  resolvePhone(phone: string): string | undefined {
    return this.#byPhone.get(phone);
  }
}
