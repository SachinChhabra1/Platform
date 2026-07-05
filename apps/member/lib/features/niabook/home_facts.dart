/// NiaBook home — TRUTH. The facts the backend knows, which the home renders
/// live wherever a backend is configured (Founder direction, 2026-07-05):
/// wage earned, living cost, sent home, saved, kept, savings balance, floor
/// protected, wallet available. Everything else on the home is DERIVED from these
/// facts in the client ([deriveHomeInsights]) — never invented.
///
/// Fields that the backend does not yet serve (per-month kept history for the
/// momentum chart, per-pillar attribution) are carried here too but are
/// sample/derived for UAT and clearly labelled as such; they become live when the
/// corresponding read-models land. Indefensible metrics (percentile, lifetime
/// built) are deliberately ABSENT — we do not show what we cannot answer for.
///
/// Money is integer paise, formatted by [formatPaise].
library;

import 'package:nia_api/api.dart' show MonthlyOverview, MoneyStoryLineDirectionEnum;

/// One pillar's contribution to what the Member kept — a per-pillar fact
/// (each pillar owns its own contribution figure). Sample for UAT until the
/// contribution read-model lands.
class PillarContribution {
  const PillarContribution(this.label, this.detail, this.gainPaise, this.route);
  final String label;
  final String detail;
  final int gainPaise;
  final String route;
}

/// What the Member kept in one month — the momentum series point.
class MonthKept {
  const MonthKept(this.month, this.keptPaise);
  final String month;
  final int keptPaise;
}

/// One profile fact — who the Member is becoming (tenure, certifications, cities,
/// strong months). Defensible facts (not aggregates like lifetime-built); sample
/// for UAT until wired to the profile read-model.
class IdentityStat {
  const IdentityStat(this.label, this.value);
  final String label;
  final String value;
}

class HomeFacts {
  const HomeFacts({
    required this.monthLabel,
    required this.memberName,
    required this.memberSite,
    required this.earnedPaise,
    required this.livingPaise,
    required this.familyPaise,
    required this.savedPaise,
    required this.keptPaise,
    required this.savingsBalancePaise,
    required this.floorProtectedPaise,
    required this.walletAvailablePaise,
    required this.keptHistory,
    required this.contributions,
    required this.identity,
    this.live = false,
  });

  final String monthLabel;
  final String memberName;
  final String memberSite;

  // ── The waterfall — this month's truth ────────────────────────────────────
  final int earnedPaise; // wage received
  final int livingPaise; // living cost, all in
  final int familyPaise; // sent to family
  final int savedPaise; // saved (Sukh / savings)
  final int keptPaise; // what stayed with the Member

  // ── More truth ─────────────────────────────────────────────────────────────
  final int savingsBalancePaise;
  final int floorProtectedPaise;
  final int walletAvailablePaise;

  /// Momentum series (kept per month). Live once a multi-month read-model exists;
  /// sample for UAT.
  final List<MonthKept> keptHistory;

  /// Per-pillar attribution. Live once the contribution read-model exists; sample
  /// for UAT.
  final List<PillarContribution> contributions;

  /// Profile facts (who you're becoming). Sample for UAT until the profile
  /// read-model lands.
  final List<IdentityStat> identity;

  /// True when the core waterfall facts came from the live backend (vs sample).
  final bool live;

  int get priorKeptPaise => keptHistory.length >= 2 ? keptHistory[keptHistory.length - 2].keptPaise : keptPaise;

  /// Build the live truth from a Wallet Overview (the backend's monthly read
  /// model) plus the savings balance, floor and member name. Fields the overview
  /// does not carry (site, kept history, contributions) are supplied by the caller
  /// (sample for UAT). Pure and unit-testable.
  factory HomeFacts.fromOverview(
    MonthlyOverview o, {
    required String memberName,
    required String memberSite,
    required int savingsBalancePaise,
    required int floorProtectedPaise,
    required List<MonthKept> keptHistory,
    required List<PillarContribution> contributions,
    required List<IdentityStat> identity,
  }) {
    int outOf(String category) {
      for (final line in o.story) {
        if (line.category == category && line.direction == MoneyStoryLineDirectionEnum.out_) {
          return line.amount.minor;
        }
      }
      return 0;
    }

    final int living = outOf('rent') + outOf('curry');
    final int family = outOf('remittance');
    final int saved = outOf('savings');
    final int kept = o.stayedThisMonth.minor;

    // Keep the momentum series honest: its last point is this month's real kept.
    final List<MonthKept> history = keptHistory.isEmpty
        ? <MonthKept>[MonthKept(_shortMonth(o.month), kept)]
        : (<MonthKept>[...keptHistory.sublist(0, keptHistory.length - 1), MonthKept(keptHistory.last.month, kept)]);

    return HomeFacts(
      monthLabel: _longMonth(o.month),
      memberName: memberName,
      memberSite: memberSite,
      earnedPaise: o.received.minor,
      livingPaise: living,
      familyPaise: family,
      savedPaise: saved,
      keptPaise: kept,
      savingsBalancePaise: savingsBalancePaise,
      floorProtectedPaise: floorProtectedPaise,
      walletAvailablePaise: o.availableBalance.minor,
      keptHistory: history,
      contributions: contributions,
      identity: identity,
      live: true,
    );
  }

  /// The Founder-accepted sample truth (June 2026, Ramesh) — the offline default.
  static const HomeFacts sample = HomeFacts(
    monthLabel: 'June 2026',
    memberName: 'Ramesh Kumar Yadav',
    memberSite: 'Whitefield Site, Bengaluru',
    earnedPaise: 1530000, // ₹15,300
    livingPaise: 550000, // ₹5,500
    familyPaise: 500000, // ₹5,000
    savedPaise: 18500, // ₹185
    keptPaise: 480000, // ₹4,800
    savingsBalancePaise: 4820000, // ₹48,200
    floorProtectedPaise: 150000, // ₹1,500
    walletAvailablePaise: 480000, // ₹4,800
    keptHistory: <MonthKept>[
      MonthKept('Mar', 395000),
      MonthKept('Apr', 410000),
      MonthKept('May', 450000),
      MonthKept('Jun', 480000),
    ],
    contributions: <PillarContribution>[
      PillarContribution('Work', 'Overtime + on-time pay', 250000, 'work'),
      PillarContribution('Sukh', 'Certified prices vs kirana', 62000, 'store'),
      PillarContribution('Living', 'Membership on time, shared nest', 40000, 'living'),
    ],
    identity: <IdentityStat>[
      IdentityStat('Years in Nia', '2.5'),
      IdentityStat('Skills completed', '4'),
      IdentityStat('Cities worked', '2'),
      IdentityStat('Strong months', '28'),
    ],
  );
}

const List<String> _months = <String>[
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/// '2026-06' → 'June 2026'; falls back to the raw string on any surprise.
String _longMonth(String yyyyMm) {
  final parts = yyyyMm.split('-');
  if (parts.length != 2) return yyyyMm;
  final m = int.tryParse(parts[1]);
  if (m == null || m < 1 || m > 12) return yyyyMm;
  return '${_months[m - 1]} ${parts[0]}';
}

/// '2026-06' → 'Jun'.
String _shortMonth(String yyyyMm) {
  final long = _longMonth(yyyyMm).split(' ').first;
  return long.length >= 3 ? long.substring(0, 3) : long;
}
