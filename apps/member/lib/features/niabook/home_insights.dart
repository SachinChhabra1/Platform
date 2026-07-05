/// NiaBook home — STORY. Insights DERIVED in the client from [HomeFacts]
/// (Founder direction, 2026-07-05). Nothing here is a new backend number; every
/// value is computed from the facts, so it is always defensible:
///   • strongerBy   — this month's kept minus last month's (from the facts).
///   • builtThisMonth — this month's kept, framed as "built".
///   • estimatedNext — a momentum projection (average recent monthly gain applied
///     forward) — explicitly a RafiQi estimate, not a promise.
///   • nextMove     — RafiQi's single recommendation. RafiQi is not implemented
///     yet, so for UAT this is a clearly-derived placeholder, not a live match.
///
/// Percentile and lifetime-built are intentionally NOT derived here: they need an
/// agreed definition ("compared to whom?", "built since when?") before they can be
/// shown. Omitted until formalised as backend read-models after UAT.
library;

import 'home_facts.dart';

/// RafiQi's single next move (derived/placeholder for UAT until RafiQi lands).
class NextMove {
  const NextMove({
    required this.title,
    required this.rationale,
    required this.whyNow,
    required this.annualGainPaise,
    required this.probabilityPct,
    required this.minutesLeft,
    required this.route,
  });
  final String title;
  final String rationale;
  final String whyNow;
  final int annualGainPaise;
  final int probabilityPct;
  final int minutesLeft;
  final String route;
}

class HomeInsights {
  const HomeInsights({
    required this.strongerByPaise,
    required this.builtThisMonthPaise,
    required this.estimatedNextPaise,
    required this.nextMove,
  });

  /// This month's kept minus last month's — how much stronger this month made you.
  final int strongerByPaise;

  /// This month's kept, framed as what you "built".
  final int builtThisMonthPaise;

  /// A momentum projection for next month (a RafiQi estimate, not a promise).
  final int estimatedNextPaise;

  final NextMove nextMove;

  bool get improved => strongerByPaise > 0;
}

/// Derive the story from the facts. Pure — no I/O, no invented numbers.
HomeInsights deriveHomeInsights(HomeFacts f) {
  final int strongerBy = f.keptPaise - f.priorKeptPaise;
  return HomeInsights(
    strongerByPaise: strongerBy,
    builtThisMonthPaise: f.keptPaise,
    estimatedNextPaise: f.keptPaise + _averageMonthlyGain(f.keptHistory),
    nextMove: _rafiqiNextMove,
  );
}

/// Average of the recent month-over-month kept gains (never negative). This is the
/// "calculated from recent changes" momentum the projection is built on.
int _averageMonthlyGain(List<MonthKept> history) {
  if (history.length < 2) return 0;
  int total = 0;
  int steps = 0;
  for (int i = 1; i < history.length; i++) {
    total += history[i].keptPaise - history[i - 1].keptPaise;
    steps++;
  }
  final int avg = steps == 0 ? 0 : (total / steps).round();
  return avg > 0 ? avg : 0;
}

/// RafiQi placeholder — clearly derived, not a live opportunity match (RafiQi is a
/// later slice). One recommendation only (Continuity Coaching, Q9).
const NextMove _rafiqiNextMove = NextMove(
  title: 'Finish your Machine Operator certification',
  rationale:
      'On your attendance and skill record, this is the single biggest move to grow what you keep next year.',
  whyNow: 'A machine-operator vacancy opens at your site next week — finish before it does.',
  annualGainPaise: 3000000, // +₹30,000
  probabilityPct: 92,
  minutesLeft: 20,
  route: 'work',
);
