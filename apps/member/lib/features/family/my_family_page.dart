import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../wallet/wallet_overview_source.dart';
import '../wallet/wallet_page.dart' show formatRupees;

/// My Family — the people the Member's work is for (spec 0001 §2.2).
///
/// Q3 resolved (2026-06-30): **My Family is a Member-only VIEW the Member
/// controls** ([A4]), not a family account — family is part of the Member ([A1]).
/// A family-*facing* surface (family reaching in) is FE-2, deferred pending
/// consent design (Article XV); so this view is his alone, and says so.
///
/// The money that reaches his family is **live**: the remittance lines of the
/// current Wallet Overview are summed through the generated client, so "what
/// reaches them" is the real figure, not invented. Names/relationships are
/// illustrative until a family record exists (a later slice).
class MyFamilyPage extends StatefulWidget {
  const MyFamilyPage({super.key, this.walletSource = const SampleWalletOverviewSource()});

  final WalletOverviewSource walletSource;

  @override
  State<MyFamilyPage> createState() => _MyFamilyPageState();
}

class _MyFamilyPageState extends State<MyFamilyPage> {
  late final Future<MonthlyOverview> _overview = widget.walletSource.currentOverview();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('My Family')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            NiaTokens.s5, NiaTokens.s6, NiaTokens.s5, NiaTokens.s8),
        children: <Widget>[
          Text('The people your work is for.',
              style: theme.textTheme.headlineMedium?.copyWith(height: 1.2)),
          const SizedBox(height: NiaTokens.s7),

          // The family member(s). One, illustratively, today.
          Row(
            children: <Widget>[
              const Monogram(initials: 'S', size: 56),
              const SizedBox(width: NiaTokens.s4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(PrototypeData.familyMemberName,
                        style: theme.textTheme.titleLarge),
                    const SizedBox(height: 2),
                    Text(
                      '${PrototypeData.familyMemberRelation} · ${PrototypeData.familyMemberPlace}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: NiaTokens.s7),

          // What reaches them — live from the Wallet remittance lines (§3).
          const SectionLabel('What reaches them'),
          const SizedBox(height: NiaTokens.s2),
          FutureBuilder<MonthlyOverview>(
            future: _overview,
            builder: (BuildContext context, AsyncSnapshot<MonthlyOverview> snap) {
              if (!snap.hasData) {
                return const SizedBox(
                  height: 28,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                );
              }
              final sent = _remittanceTotal(snap.data!);
              if (sent.minor <= 0) {
                return Text('Nothing sent home yet this month.',
                    style: theme.textTheme.bodyLarge);
              }
              return RichText(
                text: TextSpan(
                  style: theme.textTheme.bodyLarge?.copyWith(color: NiaTokens.ink),
                  children: <InlineSpan>[
                    TextSpan(
                      text: formatRupees(sent),
                      style: const TextStyle(
                          color: NiaTokens.green, fontWeight: FontWeight.w600),
                    ),
                    TextSpan(
                        text:
                            ' reached ${PrototypeData.familyMemberName} this month.'),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: NiaTokens.s3),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              style: TextButton.styleFrom(
                foregroundColor: NiaTokens.ink,
                padding: const EdgeInsets.symmetric(
                    horizontal: NiaTokens.s2, vertical: NiaTokens.s2),
              ),
              onPressed: () => prototypeNoOp(context, 'Send money home'),
              icon: const Icon(Icons.arrow_forward, size: 18),
              label: Text('Send money home', style: theme.textTheme.bodyLarge),
            ),
          ),
          const SizedBox(height: NiaTokens.s8),

          // Yours alone (spec [A4]; FE-2 deferred). Stated plainly, not as a gap.
          const SectionLabel('Yours alone'),
          const SizedBox(height: NiaTokens.s2),
          Text(
            'My Family is your private view. Your family can’t see it — whether '
            'they ever can is a separate choice you would make, and nothing is '
            'shared by default.',
            style: theme.textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  static Money _remittanceTotal(MonthlyOverview overview) {
    var minor = 0;
    for (final MoneyStoryLine line in overview.story) {
      if (line.category == 'remittance') minor += line.amount.minor;
    }
    return Money(minor: minor, currency: MoneyCurrencyEnum.INR);
  }
}
