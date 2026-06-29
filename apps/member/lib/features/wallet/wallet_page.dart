import 'package:flutter/material.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// Wallet Overview (read-only) — the Wallet is the operating layer beneath the
/// clusters (Book IV §1.3); legibility precedes any money-taking feature
/// (Article II; Book II §4.8). Money is in the Member's terms (Book III §6.4).
///
/// Iteration 3 answers one question — "what happened to my salary?" — as a
/// story: the salary arrives, it goes to a few real things, and what is left is
/// his. No balance column, no ledger rules; it should never read as a bank
/// statement. Green means in context (§2.1).
///
/// Visual shell only. The real Wallet Overview is the first production slice
/// (ADR-0008), built from a locked spec; no ledger, no engine, no API.
class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s6, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
        const SectionLabel('This month'),
        const SizedBox(height: NiaTokens.s2),
        Text(
          'Your ${PrototypeData.wageReceived} salary arrived — in full, and on time.',
          style: theme.textTheme.titleLarge?.copyWith(height: 1.3),
        ),
        const SizedBox(height: NiaTokens.s7),

        const _StoryLine(amount: PrototypeData.rentPaid, rest: ' paid for your room.'),
        const _StoryLine(amount: PrototypeData.curryPaid, rest: ' went to your meals.'),
        const _StoryLine(
          amount: PrototypeData.savedThisMonth,
          rest: ' you put into savings.',
          amountColor: NiaTokens.green,
        ),
        const _StoryLine(
          amount: PrototypeData.sentHome,
          rest: ' reached Sunita, back home.',
          amountColor: NiaTokens.green,
        ),
        const SizedBox(height: NiaTokens.s7),

        // The resolution — what is left is his.
        Text('${PrototypeData.walletAvailable} stayed with you.',
            style: theme.textTheme.headlineMedium),
        const SizedBox(height: NiaTokens.s8),

        const FdPlaceholder(
          code: 'Note',
          label:
              'Wallet logic, the ledger, and live figures are not built. The Wallet Overview is the first production slice (ADR-0008), wired only after a spec reaches Engineering Lock. Numerals will render in the Member’s script (Book III §5.3).',
        ),
      ],
    );
  }
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
