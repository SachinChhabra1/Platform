import 'package:flutter/material.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';

/// RafiQi placeholder — the Member's capital allocation agent that "allocates
/// the Member's money before the Member has to" (Book IV §1.4). RafiQi is the
/// one exception to Nia's monochrome system: its surfaces follow Apple HIG
/// colour so its signals are unambiguous (Book III §2.1).
///
/// This is a placeholder only. RafiQi has its own session in the roadmap and
/// its own (locked) spec; no allocation behaviour, no signals, nothing computed
/// is shown here.
class RafiqiPage extends StatelessWidget {
  const RafiqiPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
        Text('RafiQi', style: theme.textTheme.headlineMedium),
        const SizedBox(height: NiaTokens.s2),
        Text(
          'Your allocation agent. RafiQi watches your Wallet and your month, and moves your money before you have to.',
          style: theme.textTheme.bodyLarge,
        ),
        const SizedBox(height: NiaTokens.s7),
        const FdPlaceholder(
          code: 'Out of scope',
          label:
              'RafiQi is a later session with its own locked spec. This anchor exists so the four-anchor model is whole (Book IV §3.2); no allocation behaviour is built.',
        ),
        const SizedBox(height: NiaTokens.s5),
        Container(
          padding: const EdgeInsets.all(NiaTokens.s4),
          decoration: BoxDecoration(
            border: Border.all(color: NiaTokens.hairline),
            borderRadius: BorderRadius.circular(NiaTokens.radius),
          ),
          child: Row(
            children: <Widget>[
              const Icon(Icons.palette_outlined,
                  size: 20, color: NiaTokens.inkSecondary),
              const SizedBox(width: NiaTokens.s3),
              Expanded(
                child: Text(
                  'Design note: RafiQi’s real surfaces use Apple HIG colour — the single sanctioned exception to Nia’s monochrome (Book III §2.1).',
                  style: theme.textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
