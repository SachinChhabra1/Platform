/// The Member's assembled wallet activity — the read-side input to the Overview.
///
/// This layer is READ-ONLY (ADR-0008): it never moves money, holds no policy
/// (no lending, credit, deductions, or settlement), and does not define the
/// append-only ledger (a separate, senior-reviewed, later concern). Each
/// activity is a fact that already happened; the Overview projects these facts
/// into the Member's money story (spec 0001 §3 legibility).

import type { Money } from './money.js';

export type FlowDirection = 'in' | 'out';

export interface WalletActivity {
  readonly id: string;
  /** Calendar date the activity occurred, ISO 'YYYY-MM-DD' (the month is derived from it). */
  readonly occurredOn: string;
  /**
   * An open category code (data, not policy): 'wage', 'rent', 'curry',
   * 'savings', 'remittance', 'informal_debt_repayment', … New categories are
   * data and need no code change. The Member-facing wording is i18n's job.
   */
  readonly category: string;
  readonly direction: FlowDirection;
  /** Non-negative amount; the sign of the flow comes from `direction`. */
  readonly amount: Money;
  /**
   * Whether this activity moves the spendable balance ("what he can use now").
   * A move into locked savings still reduces the available balance, so it is
   * `true` there too.
   */
  readonly affectsAvailable: boolean;
  /**
   * Whether this activity changes the Member's TOTAL holdings — money entering
   * (wage) or leaving him entirely (rent, food, remittance). An internal
   * transfer between his own pockets (e.g. into savings) is `false`: the money
   * stayed with him, so it must not reduce "what stayed with you". This is a
   * property of the source fact (ultimately the ledger), not inferred by policy
   * here.
   */
  readonly changesHoldings: boolean;
}
