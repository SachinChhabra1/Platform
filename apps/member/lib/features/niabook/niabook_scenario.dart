/// NiaBook — the approved two-column model, held in the app layer.
///
/// The page proves progress and points at more:
///   • Left = **What became true** — money the Member gained this month, closed.
///     NiaBook proves it.
///   • Right = **More you can keep** — opportunities still waiting. RafiQi finds
///     them. Every month moves a line from right to left.
///
/// The backend is frozen in the Product Polish Phase, so this is a Founder-
/// accepted scenario, not a ledger — the same spirit as the earlier sample
/// sources. Amounts are integer paise, formatted by [formatPaise].
library;

import 'package:flutter/material.dart';

/// One line in the left column — a gain that became true this month.
class BecameTrueRow {
  const BecameTrueRow(this.amountPaise, this.label, this.icon);
  final int amountPaise;
  final String label;
  final IconData icon;
}

/// One Sukh Store member-price offer.
class SukhOffer {
  const SukhOffer(this.name, this.wasPaise, this.nowPaise);
  final String name;
  final int wasPaise;
  final int nowPaise;
}

/// The state of a right-column opportunity — sets its quiet status colour.
enum OppStatus { inProgress, ready, locked }

/// One right-column opportunity RafiQi has found.
class Opportunity {
  const Opportunity({
    this.badge,
    required this.gain,
    required this.title,
    this.detail,
    this.chain,
    required this.statusText,
    required this.status,
    this.hero = false,
  });

  /// Small caps label above the hero, e.g. 'BEST GAIN'.
  final String? badge;

  /// The gain, already formatted, e.g. '+₹2,500/mo' or '+₹500'.
  final String gain;
  final String title;

  /// A one-line explanation (non-hero cards), e.g. "Six months on the floor".
  final String? detail;

  /// The hero's chain of steps, shown with down-arrows between them.
  final List<String>? chain;

  final String statusText;
  final OppStatus status;
  final bool hero;
}

/// One month's NiaBook page.
class NiaBookMonth {
  const NiaBookMonth({
    required this.monthLabel,
    required this.memberName,
    required this.studio,
    required this.summaryDeltaPaise,
    required this.unlockedCount,
    required this.waitingCount,
    required this.becameTrue,
    required this.progressHeadline,
    required this.progressSub,
    required this.sukhSubcopy,
    required this.sukhOffers,
    required this.opportunities,
    required this.totalOpportunities,
  });

  final String monthLabel;
  final String memberName;
  final String studio;

  /// How much more stayed with the Member than last month (drives the summary
  /// line "₹300 more stayed with you than in May.").
  final int summaryDeltaPaise;
  final int unlockedCount;
  final int waitingCount;

  final List<BecameTrueRow> becameTrue;
  final String progressHeadline;
  final String progressSub;

  final String sukhSubcopy;
  final List<SukhOffer> sukhOffers;

  final List<Opportunity> opportunities;
  final int totalOpportunities;

  /// The Founder-accepted June scenario (the approved design).
  static const NiaBookMonth sample = NiaBookMonth(
    monthLabel: 'June 2025',
    memberName: 'Ramesh',
    studio: 'Umapathi Studio, Wellington Theatre',
    summaryDeltaPaise: 30000, // ₹300
    unlockedCount: 4,
    waitingCount: 9,
    becameTrue: <BecameTrueRow>[
      BecameTrueRow(500000, 'Reached your family', Icons.groups_outlined),
      BecameTrueRow(480000, 'Yours.', Icons.savings_outlined),
      BecameTrueRow(18500, 'Saved at Sukh Store', Icons.shopping_bag_outlined),
      BecameTrueRow(240000, 'Living cost', Icons.home_outlined),
    ],
    progressHeadline: 'You are ₹300 ahead of May.',
    progressSub: 'Your best month yet.',
    sukhSubcopy: 'Member prices · Umapathi Studio',
    sukhOffers: <SukhOffer>[
      SukhOffer('Atta · 5kg', 18000, 17000),
      SukhOffer('Cooking oil · 1L', 19000, 18000),
      SukhOffer('Rice · 2kg', 8400, 7600),
    ],
    opportunities: <Opportunity>[
      Opportunity(
        badge: 'BEST GAIN',
        gain: '+₹2,500/mo',
        title: 'Machine Operator',
        chain: <String>[
          'Complete certification',
          '+₹2,000 higher wages\n+₹500 Sukh voucher',
          'More stays with you',
        ],
        statusText: 'In progress · 20 min training left',
        status: OppStatus.inProgress,
        hero: true,
      ),
      Opportunity(
        gain: '+₹500',
        title: 'Monthly Sukh voucher',
        detail: "Complete this month's Skill Lesson",
        statusText: 'Ready now',
        status: OppStatus.ready,
      ),
      Opportunity(
        gain: '+₹6,000/mo',
        title: 'Supervisor',
        detail: 'Six months on the floor',
        statusText: 'Locked · 6 months experience',
        status: OppStatus.locked,
      ),
    ],
    totalOpportunities: 9,
  );
}

/// Formats integer paise as Indian-grouped rupees, e.g. ₹3,480 / ₹1,00,000.
/// Latin digits in the prototype; the Member's script in production.
String formatPaise(int paise) {
  final int whole = (paise / 100).round();
  final String sign = whole < 0 ? '-' : '';
  return '$sign₹${_groupIndian(whole.abs())}';
}

String _groupIndian(int n) {
  final String s = n.toString();
  if (s.length <= 3) return s;
  final String last3 = s.substring(s.length - 3);
  String head = s.substring(0, s.length - 3);
  final List<String> groups = <String>[];
  while (head.length > 2) {
    groups.insert(0, head.substring(head.length - 2));
    head = head.substring(0, head.length - 2);
  }
  if (head.isNotEmpty) groups.insert(0, head);
  return '${groups.join(',')},$last3';
}
