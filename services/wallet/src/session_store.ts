/// A durable `SessionStore` (infra) — sessions that survive a restart, so UAT
/// Members stay signed in across a redeploy of the single wallet process.
///
/// The `@nia/runtime` `SessionStore` interface is SYNCHRONOUS (`resolve`/`issue`/
/// `revoke`), because token resolution is on the hot path of every authed request.
/// A durable backing (file or Postgres) is async, so this store keeps an in-memory
/// `token → Session` map as the authoritative in-process view — HYDRATED from the
/// backing at boot (`load`) — and MIRRORS every mutation to the backing. The map
/// serves `resolve` synchronously; persistence is best-effort (the map is the
/// source of truth within the process). This is why sessions cannot be shared
/// cross-process over the sync interface — issuance must live in the same process
/// as the authed routes (it does: composed into the wallet app).

import { randomUUID } from 'node:crypto';
import type { Session, SessionStore } from '@nia/runtime';
import type { DurableStore } from './durable_store.js';

/** What is persisted per session: the opaque token plus the session it binds. */
export interface StoredSession {
  readonly token: string;
  readonly session: Session;
}

export interface DurableSessionStoreOptions {
  /** Mints a fresh opaque token on `issue` (injectable for deterministic tests). */
  readonly newToken?: () => string;
  /** Called if a background persistence write fails (default: swallow — the
   *  in-memory map stays authoritative for the process). */
  readonly onPersistError?: (error: unknown) => void;
}

export class DurableSessionStore implements SessionStore {
  readonly #backing: DurableStore<StoredSession>;
  readonly #byToken = new Map<string, Session>();
  readonly #newToken: () => string;
  readonly #onPersistError: (error: unknown) => void;

  private constructor(backing: DurableStore<StoredSession>, options: DurableSessionStoreOptions) {
    this.#backing = backing;
    this.#newToken = options.newToken ?? (() => `sess-${randomUUID()}`);
    this.#onPersistError = options.onPersistError ?? (() => {});
  }

  /// Build the store and hydrate the in-memory map from the durable backing, so a
  /// fresh process sees sessions issued before the restart.
  static async load(
    backing: DurableStore<StoredSession>,
    options: DurableSessionStoreOptions = {},
  ): Promise<DurableSessionStore> {
    const store = new DurableSessionStore(backing, options);
    for (const stored of await backing.values()) {
      store.#byToken.set(stored.token, stored.session);
    }
    return store;
  }

  resolve(token: string): Session | undefined {
    return this.#byToken.get(token);
  }

  /// Mint a token, revoking any session that membership already holds first (one
  /// active bound device, FD-S3). The map update is synchronous (so `resolve`
  /// sees it at once); the backing is mirrored in the background.
  issue(session: Session): string {
    for (const [token, existing] of this.#byToken) {
      if (existing.membershipId === session.membershipId) {
        this.#byToken.delete(token);
        this.#mirror(this.#backing.delete(token));
      }
    }
    const token = this.#newToken();
    this.#byToken.set(token, session);
    this.#mirror(this.#backing.put(token, { token, session }));
    return token;
  }

  /** End a session (idempotent — an unknown token is a no-op). */
  revoke(token: string): void {
    if (this.#byToken.delete(token)) {
      this.#mirror(this.#backing.delete(token));
    }
  }

  #mirror(write: Promise<void>): void {
    void write.catch(this.#onPersistError);
  }
}
