import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../theme/nia_tokens.dart';

/// The Member's standing — his lifecycle state, shown the way the Founder
/// resolved Q2 (2026-06-30): **show it, but only as it helps him act.**
///   • Active — a calm affirmation; no action.
///   • Paused — careful, dignified copy: nothing of his is lost, and the way
///     back is a person (his Operator). Continuity is the Promise (FD-4/FD-5).
///   • Closed — a relationship that ended, never a failure: he is welcome back,
///     Operator-led (restoration is a human process, FD-8/FD-9). Neutral, never
///     the danger colour.
///   • Joining (Prospective) — onboarding in progress.
///
/// Purely presentational: the parent resolves the [MembershipState] from the
/// live Membership read model and passes it in. Copy is inline here while the
/// language is still being explored (this is a Preview); production copy lives in
/// `@nia/i18n` (CLAUDE.md §12).
class MemberStanding extends StatelessWidget {
  const MemberStanding({
    super.key,
    required this.state,
    this.compact = false,
    this.onOperator,
  });

  final MembershipState state;

  /// Compact (Home): icon + line, plus a quiet action when one helps. Full
  /// (Profile): adds the reassuring subline and an Operator button.
  final bool compact;

  /// Tapped for the "Talk to your Operator" affordance (Paused / Closed /
  /// Joining). When null, no action is shown even where copy offers one.
  final VoidCallback? onOperator;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final _StandingCopy c = _copyFor(state);
    final bool showAction = c.action && onOperator != null;

    if (compact) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(c.icon, size: 16, color: c.color),
              const SizedBox(width: NiaTokens.s2),
              Flexible(
                child: Text(c.line,
                    style: theme.textTheme.bodyMedium?.copyWith(color: c.color)),
              ),
            ],
          ),
          if (showAction)
            Padding(
              padding: const EdgeInsets.only(top: NiaTokens.s1, left: 24),
              child: InkWell(
                onTap: onOperator,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Text('Talk to your Operator',
                        style: theme.textTheme.bodySmall?.copyWith(color: NiaTokens.ink)),
                    const SizedBox(width: NiaTokens.s1),
                    const Icon(Icons.arrow_forward, size: 13, color: NiaTokens.ink),
                  ],
                ),
              ),
            ),
        ],
      );
    }

    // Full (Profile): the considered version.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Icon(c.icon, size: 20, color: c.color),
            const SizedBox(width: NiaTokens.s3),
            Flexible(
              child: Text(c.line,
                  style: theme.textTheme.titleMedium?.copyWith(color: c.color)),
            ),
          ],
        ),
        const SizedBox(height: NiaTokens.s2),
        Text(c.sub, style: theme.textTheme.bodyMedium),
        if (showAction) ...<Widget>[
          const SizedBox(height: NiaTokens.s4),
          OutlinedButton.icon(
            onPressed: onOperator,
            icon: const Icon(Icons.headset_mic_outlined, size: 18),
            label: const Text('Talk to your Operator'),
          ),
        ],
      ],
    );
  }
}

class _StandingCopy {
  const _StandingCopy(this.line, this.sub, this.icon, this.color, {this.action = false});
  final String line;
  final String sub;
  final IconData icon;
  final Color color;
  final bool action;
}

_StandingCopy _copyFor(MembershipState state) {
  switch (state) {
    case MembershipState.member:
      return const _StandingCopy(
        'An active Member of Nia',
        'Your membership is active and in good standing.',
        Icons.check_circle,
        NiaTokens.green,
      );
    case MembershipState.paused:
      return const _StandingCopy(
        'Your membership is paused',
        "Everything that's yours stays yours. When you're ready to return, your Operator will help.",
        Icons.pause_circle_outline,
        NiaTokens.amber,
        action: true,
      );
    case MembershipState.closed:
      return const _StandingCopy(
        'Your membership has ended',
        "You're always welcome back — your Operator can help you rejoin.",
        Icons.history,
        NiaTokens.inkSecondary,
        action: true,
      );
    case MembershipState.prospective:
      return const _StandingCopy(
        "You're joining Nia",
        'Your Operator is setting things up with you.',
        Icons.schedule,
        NiaTokens.inkSecondary,
        action: true,
      );
    default:
      return const _StandingCopy(
        'A Member of Nia',
        'Your membership with Nia.',
        Icons.circle_outlined,
        NiaTokens.inkSecondary,
      );
  }
}
