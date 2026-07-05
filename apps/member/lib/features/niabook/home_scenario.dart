/// NiaBook home — the single-column emotional-arc model (Founder-handed v0
/// prototype, adopted 2026-07-05; supersedes the earlier two-column model).
///
/// The home proves the month moved the Member forward: a hero ("₹X stronger"),
/// the forecast ("built this month → can build next"), the story waterfall
/// (earned → living → family → saved → kept), attribution back to the pillars,
/// month-over-month momentum, RafiQi's single next move, life-since-joining, and
/// identity. Every number here is a Founder-accepted SAMPLE (UAT-derived), not a
/// ledger — the home's narrative metrics have no backend source yet, so they are
/// sample/derived until read-models are ruled. Money is integer paise, formatted
/// by [formatPaise] (reused from the scenario module).
library;

/// How one waterfall step moves the month: money in, out, added to savings, or
/// what stayed with the Member (the emphasised "kept" line).
enum FlowKind { earned, spent, added, kept }

class FlowStep {
  const FlowStep(this.label, this.amountPaise, this.kind);
  final String label;
  final int amountPaise;
  final FlowKind kind;
}

/// One "most of it came from" row — points back to a pillar, closing the loop.
class Attribution {
  const Attribution(this.label, this.detail, this.gainPaise, this.route);
  final String label;
  final String detail;
  final int gainPaise;

  /// The pillar this gain came from (e.g. 'work', 'store', 'living').
  final String route;
}

/// One bar in the momentum chart — what the Member kept that month.
class JourneyBar {
  const JourneyBar(this.month, this.keptPaise);
  final String month;
  final int keptPaise;
}

/// RafiQi's single dominant recommendation, framed as future surplus.
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

/// One "since joining" line — pre-formatted display (some are non-money, e.g. "6").
class SinceLine {
  const SinceLine(this.label, this.display);
  final String label;
  final String display;
}

/// One "who you're becoming" stat.
class IdentityStat {
  const IdentityStat(this.label, this.value);
  final String label;
  final String value;
}

/// One month of the NiaBook home.
class HomeScenario {
  const HomeScenario({
    required this.monthLabel,
    required this.memberName,
    required this.memberSite,
    required this.strongerByPaise,
    required this.lifetimeBuiltPaise,
    required this.percentileSaved,
    required this.forecastBuiltPaise,
    required this.forecastNextPaise,
    required this.flow,
    required this.attribution,
    required this.journey,
    required this.nextMove,
    required this.since,
    required this.identity,
  });

  final String monthLabel;
  final String memberName;
  final String memberSite;

  /// How much stronger this month made the Member (vs last month), in paise.
  final int strongerByPaise;

  /// Total surplus built through Nia to date, in paise.
  final int lifetimeBuiltPaise;

  /// Percentile band — "more than (100 - percentileSaved)% of members".
  final int percentileSaved;

  final int forecastBuiltPaise;
  final int forecastNextPaise;

  final List<FlowStep> flow;
  final List<Attribution> attribution;
  final List<JourneyBar> journey;
  final NextMove nextMove;
  final List<SinceLine> since;
  final List<IdentityStat> identity;

  /// "more than N% of members" — derived from the percentile band.
  int get betterThanPct => 100 - percentileSaved;

  /// The Founder-accepted sample month (June 2026, Ramesh). Sample, not a ledger.
  static const HomeScenario sample = HomeScenario(
    monthLabel: 'June 2026',
    memberName: 'Ramesh Kumar Yadav',
    memberSite: 'Whitefield Site, Bengaluru',
    strongerByPaise: 30000, // ₹300
    lifetimeBuiltPaise: 6745000, // ₹67,450
    percentileSaved: 8,
    forecastBuiltPaise: 480000, // ₹4,800 built this month
    forecastNextPaise: 760000, // ₹7,600 projected next month
    flow: <FlowStep>[
      FlowStep('You earned', 1530000, FlowKind.earned), // ₹15,300
      FlowStep('Living, all in', 550000, FlowKind.spent), // ₹5,500
      FlowStep('Sent to family', 500000, FlowKind.spent), // ₹5,000
      FlowStep('Saved at Sukh', 18500, FlowKind.added), // ₹185
      FlowStep('You kept', 480000, FlowKind.kept), // ₹4,800
    ],
    attribution: <Attribution>[
      Attribution('Work', 'Overtime + on-time pay', 250000, 'work'), // +₹2,500
      Attribution('Sukh', 'Certified prices vs kirana', 62000, 'store'), // +₹620
      Attribution('Living', 'Membership on time, shared nest', 40000, 'living'), // +₹400
    ],
    journey: <JourneyBar>[
      JourneyBar('Mar', 395000),
      JourneyBar('Apr', 410000),
      JourneyBar('May', 450000),
      JourneyBar('Jun', 480000),
    ],
    nextMove: NextMove(
      title: 'Finish your Machine Operator certification',
      rationale:
          'On your attendance and skill record, this is the single biggest move to grow what you keep next year.',
      whyNow:
          'A machine-operator vacancy opens at your site next week — finish before it does.',
      annualGainPaise: 3000000, // +₹30,000
      probabilityPct: 92,
      minutesLeft: 20,
      route: 'work',
    ),
    since: <SinceLine>[
      SinceLine('Kept more', '₹48,600'),
      SinceLine('Sent home', '₹2.4 lakh'),
      SinceLine('Certifications', '6'),
    ],
    identity: <IdentityStat>[
      IdentityStat('Years in Nia', '2.5'),
      IdentityStat('Skills completed', '4'),
      IdentityStat('Cities worked', '2'),
      IdentityStat('Strong months', '28'),
    ],
  );
}
