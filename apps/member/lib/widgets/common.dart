import 'package:flutter/material.dart';

import '../prototype/prototype.dart';
import '../theme/nia_tokens.dart';

/// Shared, Book III-grounded building blocks for the prototype screens.
/// Quiet surface, generous space, hairline separation rather than card chrome
/// (Book III §1.1, §2.3).

/// A small, calm section label (caption weight, secondary ink).
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    // Iteration 2: sentence case, no tracking, lighter weight — a quiet label,
    // not a shouted one. Typography and space carry the structure now.
    return Padding(
      padding: const EdgeInsets.only(bottom: NiaTokens.s2),
      // A section heading — expose it as a header so screen-reader users can
      // navigate by section (golden-neutral: semantics don't paint).
      child: Semantics(
        header: true,
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: NiaTokens.inkSecondary,
          ),
        ),
      ),
    );
  }
}

/// Opens the Operator — a named human — from anywhere, in one tap
/// (Book IV §3.6, §4.9). No behaviour: a real call is wired post-Lock.
Future<void> openOperatorSheet(BuildContext context) {
  final theme = Theme.of(context);
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: NiaTokens.ground,
    showDragHandle: true,
    builder: (BuildContext context) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5,
          0,
          NiaTokens.s5,
          NiaTokens.s7,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const SectionLabel('Your Operator'),
            Row(
              children: <Widget>[
                const _Avatar(initials: 'S', size: 56),
                const SizedBox(width: NiaTokens.s4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        PrototypeData.operatorName,
                        style: theme.textTheme.titleLarge,
                      ),
                      const SizedBox(height: NiaTokens.s1),
                      Text(
                        PrototypeData.operatorStudio,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: NiaTokens.s5),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: NiaTokens.ink,
                  padding: const EdgeInsets.symmetric(vertical: NiaTokens.s4),
                ),
                onPressed: () => _proto(context, 'Call Operator'),
                icon: const Icon(Icons.call_outlined),
                label: Text('Call ${PrototypeData.operatorName}'),
              ),
            ),
            const SizedBox(height: NiaTokens.s4),
            Text(
              'A human you know, one tap from any screen (Book IV §3.6).',
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      );
    },
  );
}

/// A round monogram stands in for the Member/Operator photo. Book III §2.5
/// forbids aspirational stock imagery; documentary photography is wired later.
class _Avatar extends StatelessWidget {
  const _Avatar({required this.initials, this.size = 40});

  final String initials;
  final double size;

  @override
  Widget build(BuildContext context) {
    // Decorative: the monogram stands in for a photo. The Member's name is always
    // adjacent, so the raw initial must not be announced on its own ("R").
    return ExcludeSemantics(
      child: Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: const BoxDecoration(
          color: NiaTokens.hairline,
          shape: BoxShape.circle,
        ),
        child: Text(
          initials,
          style: TextStyle(
            fontSize: size * 0.4,
            fontWeight: FontWeight.w600,
            color: NiaTokens.ink,
          ),
        ),
      ),
    );
  }
}

/// Public monogram avatar for use on screens.
class Monogram extends StatelessWidget {
  const Monogram({super.key, required this.initials, this.size = 40});

  final String initials;
  final double size;

  @override
  Widget build(BuildContext context) => _Avatar(initials: initials, size: size);
}

/// Honest no-op for prototype taps: states plainly that no behaviour exists yet.
void _proto(BuildContext context, String action) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: NiaTokens.ink,
      content: Text('"$action" — no behaviour in the prototype.'),
    ),
  );
}

/// Exposed so screens can use the same honest no-op.
void prototypeNoOp(BuildContext context, String action) =>
    _proto(context, action);

/// Nia Emergency — the Member's one-tap way to reach help from the SOS action.
///
/// The routing is deliberately ABSTRACT. Emergencies differ — medical, safety,
/// harassment, fire, accommodation, a family emergency — so tomorrow this can
/// route intelligently to a warden, security, an ambulance, factory HR, or the
/// Operator without changing the SOS button. Today it reaches the Operator (a
/// known human) as the fallback route. SOS is NOT permanently the Operator; do
/// not couple the UI to that.
Future<void> openNiaEmergency(BuildContext context) {
  return openOperatorSheet(context);
}
