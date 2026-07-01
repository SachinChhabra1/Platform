/// NiaBook demo scenarios — the Founder-accepted "Book of Months" story, held
/// in the app layer.
///
/// NiaBook answers one question — "was leaving home worthwhile this month?" — and
/// carries data the Wallet Overview contract does not (Sukh Store savings, the
/// work voucher, the month-over-month comparison). The backend is frozen in the
/// Product Polish Phase, so these live here as demo data, in the same spirit as
/// `SampleWalletOverviewSource`: a Founder-accepted scenario, not a ledger. When
/// the read model grows to carry the Nia-value lines, this is where the source
/// port slots in.
///
/// The product thesis this screen makes visible: **Nia does not create salary —
/// Nia reduces the cost of migration.** Every rupee Nia saves moves from "the
/// cost of being here" into "money that stays with you."
library;

/// How the "what Nia made smaller" band reads for a given month — the five
/// states the demo must show.
enum NiaBandState {
  /// Saved at Sukh Store this month, and a voucher is still waiting.
  savingAndVoucher,

  /// No saving yet; a ₹500 voucher is waiting, unused (grey — desire).
  voucherWaiting,

  /// The ₹500 voucher was used at Sukh Store — the money stayed in his pocket.
  voucherRedeemed,

  /// No shopping savings yet; an invitation to save at Sukh Store.
  noSavingsInvite,

  /// He did not get work through Nia this month, so no voucher — the pull.
  noNiaWork,
}

/// One month's page in the Book of Months. Amounts are integer paise, formatted
/// by [formatPaise]; the verdict and story are already in the Member's language.
class NiaBookMonth {
  const NiaBookMonth({
    required this.demoLabel,
    required this.monthLabel,
    required this.verdict,
    required this.salaryPaise,
    required this.reachedHomePaise,
    required this.stayedWithYouPaise,
    required this.savedPortionPaise,
    required this.inHandNowPaise,
    required this.costOfBeingHerePaise,
    required this.sukhSavingPaise,
    required this.voucherPaise,
    required this.band,
    this.closingHeadline,
    this.closingDetail,
    this.closingNudge,
  });

  /// Short label for the demo state switcher.
  final String demoLabel;

  /// The page header, e.g. "June 2026".
  final String monthLabel;

  /// The verdict that opens the page — the answer, before any number. Never
  /// shame, even in a lean month.
  final String verdict;

  final int salaryPaise;
  final int reachedHomePaise;
  final int stayedWithYouPaise;
  final int savedPortionPaise;
  final int inHandNowPaise;
  final int costOfBeingHerePaise;

  /// What Nia kept in his pocket at Sukh Store this month (0 when none).
  final int sukhSavingPaise;

  /// The face value of the Sukh Store work voucher.
  final int voucherPaise;

  /// Which "what Nia made smaller" band this month shows.
  final NiaBandState band;

  /// The closing verdict — the page ends with a report-card, not a stop. The
  /// headline is the verdict ("June was better than May."), the detail is the
  /// proof ("You kept ₹300 more."), the nudge is the forward word ("Keep
  /// going."). Null on a first page with nothing to compare.
  final String? closingHeadline;
  final String? closingDetail;
  final String? closingNudge;

  // The shared June scenario. Every rupee is accounted for: salary 14,000 =
  // home 5,000 + here 4,200 (room + food) + stayed 4,800. "In hand now" (3,480)
  // spans months (it carries ₹680 from May), so it is a sub-line of "stayed",
  // never a fourth figure.
  static const int _salary = 1400000;
  static const int _home = 500000;
  static const int _stayed = 480000;
  static const int _saved = 200000;
  static const int _inHand = 348000;
  static const int _here = 420000;
  static const int _voucher = 50000;
  static const int _sukh = 18500;

  static const NiaBookMonth _base = NiaBookMonth(
    demoLabel: 'Sukh Store savings',
    monthLabel: 'June 2026',
    verdict: 'June was worth it.',
    salaryPaise: _salary,
    reachedHomePaise: _home,
    stayedWithYouPaise: _stayed,
    savedPortionPaise: _saved,
    inHandNowPaise: _inHand,
    costOfBeingHerePaise: _here,
    sukhSavingPaise: _sukh,
    voucherPaise: _voucher,
    band: NiaBandState.savingAndVoucher,
    closingHeadline: 'June was better than May.',
    closingDetail: 'You kept ₹300 more.',
    closingNudge: 'Keep going.',
  );

  NiaBookMonth _copyWith({
    String? demoLabel,
    int? sukhSavingPaise,
    NiaBandState? band,
  }) =>
      NiaBookMonth(
        demoLabel: demoLabel ?? this.demoLabel,
        monthLabel: monthLabel,
        verdict: verdict,
        salaryPaise: salaryPaise,
        reachedHomePaise: reachedHomePaise,
        stayedWithYouPaise: stayedWithYouPaise,
        savedPortionPaise: savedPortionPaise,
        inHandNowPaise: inHandNowPaise,
        costOfBeingHerePaise: costOfBeingHerePaise,
        sukhSavingPaise: sukhSavingPaise ?? this.sukhSavingPaise,
        voucherPaise: voucherPaise,
        band: band ?? this.band,
        closingHeadline: closingHeadline,
        closingDetail: closingDetail,
        closingNudge: closingNudge,
      );

  /// The default June page first, then the five states the demo must show. The
  /// earned / sent / kept story is identical across all of them — only the
  /// "what Nia made smaller" band changes, which is the point: the salary is his,
  /// and Nia's value is the extra it kept in his pocket.
  static final List<NiaBookMonth> demoStates = <NiaBookMonth>[
    _base,
    _base._copyWith(
      demoLabel: 'Unused ₹500 voucher',
      sukhSavingPaise: 0,
      band: NiaBandState.voucherWaiting,
    ),
    _base._copyWith(
      demoLabel: 'Redeemed voucher',
      band: NiaBandState.voucherRedeemed,
    ),
    _base._copyWith(
      demoLabel: 'No shopping savings',
      sukhSavingPaise: 0,
      band: NiaBandState.noSavingsInvite,
    ),
    _base._copyWith(
      demoLabel: 'No work through Nia',
      sukhSavingPaise: 0,
      band: NiaBandState.noNiaWork,
    ),
  ];
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
