import 'package:flutter/material.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';

/// The Promise (Book I §4.19) — a short, written statement of what a Member can
/// expect from Nia in the next thirty days. Every Member sees it; it is the same
/// across Nia. Form is Option (c): one anchoring sentence plus a small set of
/// supporting guarantees, in a quiet institutional voice, drawn only from
/// guarantees that already exist in Nia OS.
///
/// The exact wording is FD-2 — three candidates (C-1/C-2/C-3) are awaiting
/// Product selection. C-1 is shown here as a working draft, clearly marked.
class PromisePage extends StatelessWidget {
  const PromisePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('The Promise'),
        actions: const <Widget>[
          Center(child: PrototypeChip()),
          SizedBox(width: NiaTokens.s4),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            NiaTokens.s5, NiaTokens.s7, NiaTokens.s5, NiaTokens.s8),
        children: <Widget>[
          Text('${PrototypeData.memberName},',
              style: theme.textTheme.bodyLarge),
          const SizedBox(height: NiaTokens.s4),
          // The anchoring sentence (Option (c)).
          Text(
            'your money is yours — and we keep it that way.',
            style: theme.textTheme.headlineMedium,
          ),
          const SizedBox(height: NiaTokens.s7),
          const _PromiseLine('Your wage, in full and on time.'),
          const _PromiseLine('Every rupee you earn, save, and send — visible to you.'),
          const _PromiseLine('A person you know, one tap away.'),
          const _PromiseLine(
              'Nothing about your terms changes without you knowing first.'),
          const SizedBox(height: NiaTokens.s7),
          Text(
            'The same promise for every Member, everywhere.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: NiaTokens.s7),
          const FdPlaceholder(
            code: 'FD-2',
            label:
                'Form is chosen (Option c). The exact wording is a working draft (candidate C-1). Three candidates — C-1, C-2, C-3 — await Product selection.',
          ),
        ],
      ),
    );
  }
}

class _PromiseLine extends StatelessWidget {
  const _PromiseLine(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: NiaTokens.s4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            margin: const EdgeInsets.only(top: 10),
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
                color: NiaTokens.ink, shape: BoxShape.circle),
          ),
          const SizedBox(width: NiaTokens.s4),
          Expanded(child: Text(text, style: theme.textTheme.bodyLarge)),
        ],
      ),
    );
  }
}
