import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// Recovery — "this phone is your Nia phone", and how you get back in if it's
/// lost (a MOCK of the forthcoming flow).
///
/// Spec 0002 (Member Session & Recovery, Engineering-Locked) makes recovery
/// **human-mediated and in-person**: the number alone never authenticates a new
/// device (FD-S2 / Security boundary 2); an Operator, having verified the Member
/// in person, rebinds his account to the new phone (ERR-2), and the Member is
/// told plainly — *"Your Nia phone was changed with help from Nia."* This screen
/// previews that experience. The real flow is **Slice D** of the plan (operator-
/// triggered rebind); nothing here authenticates or moves an account yet.
class RecoveryPage extends StatelessWidget {
  const RecoveryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Your Nia phone')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            NiaTokens.s5, NiaTokens.s7, NiaTokens.s5, NiaTokens.s8),
        children: <Widget>[
          const Icon(Icons.smartphone_outlined, size: 40, color: NiaTokens.ink),
          const SizedBox(height: NiaTokens.s5),
          Text(
            'This phone is your Nia phone.',
            style: theme.textTheme.headlineMedium?.copyWith(height: 1.2),
          ),
          const SizedBox(height: NiaTokens.s3),
          Text(
            'Your account is bound to this device. Only this phone signs in as you — '
            'so a lost or borrowed phone is never a way into your money.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: NiaTokens.s8),

          const SectionLabel('Lost your phone?'),
          const SizedBox(height: NiaTokens.s2),
          Text(
            'Visit your Nia Studio.',
            style: theme.textTheme.titleLarge,
          ),
          const SizedBox(height: NiaTokens.s2),
          Text(
            "We'll help you safely move your account to your new phone, in person. "
            'Your number alone is never enough — we make sure it is really you, the '
            'way only a person you know can.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: NiaTokens.s6),
          OutlinedButton.icon(
            onPressed: () => openOperatorSheet(context),
            icon: const Icon(Icons.headset_mic_outlined),
            label: const Text('Talk to your Operator'),
          ),
          const SizedBox(height: NiaTokens.s8),

          // Honest marker: this previews spec 0002's human-mediated recovery
          // (FD-S2 / ERR-2). The working flow is Slice D (operator rebind).
          Container(
            padding: const EdgeInsets.only(left: NiaTokens.s3),
            decoration: const BoxDecoration(
              border: Border(left: BorderSide(color: NiaTokens.inkSecondary, width: 2)),
            ),
            child: Text(
              'Preview of the recovery experience. The working flow — an Operator '
              'rebinding your account in person, with an audit and a notice to you — '
              'is the next session-recovery slice (spec 0002, FD-S2 / ERR-2).',
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
