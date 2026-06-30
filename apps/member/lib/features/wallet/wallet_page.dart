import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'wallet_overview_source.dart';

/// Wallet Overview (read-only) — the Wallet is the operating layer beneath the
/// clusters (Book IV §1.3); legibility precedes any money-taking feature
/// (Article II; Book II §4.8). Money is in the Member's terms (Book III §6.4).
///
/// Iteration 3 answers one question — "what happened to my salary?" — as a
/// story: the salary arrives, it goes to a few real things, and what is left is
/// his. No balance column, no ledger rules; it should never read as a bank
/// statement. Green means in context (§2.1).
///
/// Wired (spec §14 step 4) to the Wallet Overview read model via the generated
/// `nia_api` client: it renders a [MonthlyOverview] and shows the TWO DISTINCT
/// figures §3 requires — what stayed with you this month vs what you can use
/// now — never the same number undistinguished. The default source is the
/// Founder-accepted sample (this is still a Product Review Prototype; no backend
/// is wired in by default).
class WalletPage extends StatefulWidget {
  const WalletPage({super.key, this.source = const SampleWalletOverviewSource()});

  final WalletOverviewSource source;

  @override
  State<WalletPage> createState() => _WalletPageState();
}

class _WalletPageState extends State<WalletPage> {
  late final Future<MonthlyOverview> _overview = widget.source.currentOverview();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s6, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
        const SectionLabel('This month'),
        const SizedBox(height: NiaTokens.s2),
        FutureBuilder<MonthlyOverview>(
          future: _overview,
          builder: (BuildContext context, AsyncSnapshot<MonthlyOverview> snap) {
            if (!snap.hasData) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: NiaTokens.s8),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            return _MoneyStory(overview: snap.data!);
          },
        ),
      ],
    );
  }
}

/// The assembled money story for one month, rendered from the read model.
class _MoneyStory extends StatelessWidget {
  const _MoneyStory({required this.overview});

  final MonthlyOverview overview;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final outflows = overview.story
        .where((MoneyStoryLine line) => line.category != 'wage')
        .toList(growable: false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          'Your ${formatRupees(overview.received)} salary arrived — in full, and on time.',
          style: theme.textTheme.titleLarge?.copyWith(height: 1.3),
        ),
        const SizedBox(height: NiaTokens.s7),

        for (final MoneyStoryLine line in outflows)
          _StoryLine(
            amount: formatRupees(line.amount),
            rest: _restFor(line.category),
            amountColor: _isKept(line.category) ? NiaTokens.green : null,
          ),
        const SizedBox(height: NiaTokens.s7),

        // The resolution — the TWO DISTINCT figures §3 requires. Kept apart, in
        // the Member's terms: what remained his this month, then what he can
        // spend now. They are different concepts and different numbers.
        Text('${formatRupees(overview.stayedThisMonth)} stayed with you.',
            style: theme.textTheme.headlineMedium),
        const SizedBox(height: NiaTokens.s3),
        Text('${formatRupees(overview.availableBalance)} is yours to use now.',
            style: theme.textTheme.titleMedium
                ?.copyWith(color: NiaTokens.inkSecondary)),
        const SizedBox(height: NiaTokens.s8),

        const FdPlaceholder(
          code: 'Note',
          label:
              'Figures come from the Wallet Overview read model (@nia/wallet) via the generated client. The ledger and live money movement are later, senior-reviewed slices; this prototype shows the Founder-accepted scenario. Numerals will render in the Member’s script (Book III §5.3).',
        ),
      ],
    );
  }

  // Money that stayed his (savings he kept, money that reached his family) reads
  // in context as good — green (§2.1). Everything else is neutral ink.
  static bool _isKept(String category) =>
      category == 'savings' || category == 'remittance';

  static String _restFor(String category) {
    switch (category) {
      case 'rent':
        return ' paid for your room.';
      case 'curry':
        return ' went to your meals.';
      case 'savings':
        return ' you put into savings.';
      case 'remittance':
        return ' reached your family back home.';
      case 'informal_debt_repayment':
        return ' repaid what you had borrowed.';
      case 'deduction':
        return ' was deducted this month.';
      default:
        return ' · $category';
    }
  }
}

/// Formats Money (integer paise) as Indian-grouped rupees, e.g. ₹3,480 /
/// ₹1,00,000. Latin digits in the prototype; the Member's script in production
/// (Book III §5.3). A lean month may be negative and reads plainly as -₹X.
String formatRupees(Money money) {
  final int whole = (money.minor / 100).round();
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

/// One line of the money story: an amount, then the rest of the sentence. The
/// amount may carry a reserved meaning-colour (Book III §2.1).
class _StoryLine extends StatelessWidget {
  const _StoryLine({
    required this.amount,
    required this.rest,
    this.amountColor,
  });

  final String amount;
  final String rest;
  final Color? amountColor;

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).textTheme.bodyLarge;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3),
      child: RichText(
        text: TextSpan(
          style: base?.copyWith(color: NiaTokens.ink),
          children: <InlineSpan>[
            TextSpan(
              text: amount,
              style: TextStyle(
                color: amountColor ?? NiaTokens.ink,
                fontWeight: FontWeight.w600,
              ),
            ),
            TextSpan(text: rest),
          ],
        ),
      ),
    );
  }
}
