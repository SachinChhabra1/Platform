/// The Wallet Overview read model (spec 0001 §3 legibility; ADR-0008).
///
/// Answers "what happened to my money?" as an assembled story, in the Member's
/// terms. A pure projection over WalletActivity facts — deterministic, no I/O,
/// no money movement. It honours the locked legibility requirements (§3):
///   • two distinct figures — `availableBalance` (usable now) vs
///     `stayedThisMonth` (what remained the Member's this month) — never shown
///     as the same number undistinguished;
///   • a bad month reads without shame — a deduction or informal-debt repayment
///     is an ordinary story line, structurally identical to good news; the model
///     carries NO severity, alarm, or shame flag;
///   • history is reachable — prior months are enumerable and each is
///     projectable (deep per-transaction detail, screen 4.2, is a later slice).
///
/// "What stayed with you this month" is defined as the net change in the
/// Member's total holdings over the month (driven by each activity's
/// `changesHoldings` flag, which comes from the source data — savings stays
/// with him, rent/food/remittance leave him). The spec mandates that this
/// figure be distinct from the available balance but does not fix its exact
/// arithmetic; this interpretation is carried for Product confirmation at the
/// next Wallet Overview Product Review.

import type { Money } from './money.js';
import { paise } from './money.js';
import type { FlowDirection, WalletActivity } from './activity.js';

/** One neutral line of the money story. No severity/shame field — that is the point. */
export interface MoneyStoryLine {
  readonly activityId: string;
  readonly category: string;
  readonly direction: FlowDirection;
  readonly amount: Money;
}

export interface MonthlyOverview {
  /** The month this overview covers, 'YYYY-MM'. */
  readonly month: string;
  /** Total that came in this month. */
  readonly received: Money;
  /**
   * What stayed with the Member this month — the net change in his total
   * holdings (savings he kept + surplus), distinct from what he can spend now.
   * May be low or negative in a lean month; represented plainly, never as a
   * failure (§3; §5.4 failures are private).
   */
  readonly stayedThisMonth: Money;
  /**
   * What he can use now: the running spendable balance through the end of this
   * month (carryover included). Deliberately distinct from `stayedThisMonth`.
   */
  readonly availableBalance: Money;
  /** The month's activities as neutral story lines, in the order they occurred. */
  readonly story: readonly MoneyStoryLine[];
}

function monthOf(activity: WalletActivity): string {
  return activity.occurredOn.slice(0, 7);
}

function signedMinor(activity: WalletActivity): number {
  return activity.direction === 'in'
    ? activity.amount.minor
    : -activity.amount.minor;
}

/** Distinct months present in the log, most recent first — the reachable history. */
export function availableMonths(
  activities: readonly WalletActivity[],
): readonly string[] {
  const months = new Set<string>();
  for (const activity of activities) months.add(monthOf(activity));
  return [...months].sort().reverse();
}

/** Projects the Overview for one month ('YYYY-MM') from the assembled activity log. */
export function overviewForMonth(
  activities: readonly WalletActivity[],
  month: string,
): MonthlyOverview {
  const inMonth = activities
    .filter((activity) => monthOf(activity) === month)
    .sort((a, b) =>
      a.occurredOn < b.occurredOn ? -1 : a.occurredOn > b.occurredOn ? 1 : 0,
    );

  let receivedMinor = 0;
  let stayedMinor = 0;
  for (const activity of inMonth) {
    if (activity.direction === 'in') receivedMinor += activity.amount.minor;
    if (activity.changesHoldings) stayedMinor += signedMinor(activity);
  }

  // Available balance is the running spendable total through the end of `month`.
  let availableMinor = 0;
  for (const activity of activities) {
    if (activity.affectsAvailable && monthOf(activity) <= month) {
      availableMinor += signedMinor(activity);
    }
  }

  const story: MoneyStoryLine[] = inMonth.map((activity) => ({
    activityId: activity.id,
    category: activity.category,
    direction: activity.direction,
    amount: activity.amount,
  }));

  return {
    month,
    received: paise(receivedMinor),
    stayedThisMonth: paise(stayedMinor),
    availableBalance: paise(availableMinor),
    story,
  };
}

/** The current month's Overview, where "current" is derived from `asOf` (UTC). */
export function currentMonthOverview(
  activities: readonly WalletActivity[],
  asOf: Date,
): MonthlyOverview {
  const month = `${asOf.getUTCFullYear()}-${String(
    asOf.getUTCMonth() + 1,
  ).padStart(2, '0')}`;
  return overviewForMonth(activities, month);
}
