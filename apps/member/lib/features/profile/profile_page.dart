import 'package:flutter/material.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// Profile — the Member's identity, his Operator, and his data rights.
///
/// He is known by name, not number (Book III §6.3, Truth 1.7); he owns his data
/// and Nia is custodian (Article XV). Undecided behaviour (tenure, state
/// visibility, consent) is shown as a marked placeholder, never invented.
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: const <Widget>[
          Center(child: PrototypeChip()),
          SizedBox(width: NiaTokens.s4),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
            NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s8),
        children: <Widget>[
          Row(
            children: <Widget>[
              const Monogram(initials: 'R', size: 64),
              const SizedBox(width: NiaTokens.s4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(PrototypeData.memberFullName,
                        style: theme.textTheme.titleLarge),
                    const SizedBox(height: NiaTokens.s1),
                    Text('A Member of Nia', style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: NiaTokens.s7),

          const SectionLabel('Your Operator'),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Monogram(initials: 'S', size: 44),
            title: Text(PrototypeData.operatorName,
                style: theme.textTheme.bodyLarge),
            subtitle: Text(PrototypeData.operatorStudio,
                style: theme.textTheme.bodySmall),
            trailing: IconButton(
              icon: const Icon(Icons.call_outlined),
              onPressed: () => openOperatorSheet(context),
            ),
            onTap: () => openOperatorSheet(context),
          ),
          const SizedBox(height: NiaTokens.s6),

          const SectionLabel('Your details'),
          _Fact(label: 'Home', value: PrototypeData.homePlace),
          const Divider(),
          _Fact(label: 'Language', value: PrototypeData.language),
          const Divider(),
          _Fact(
              label: 'Emergency contact',
              value: PrototypeData.emergencyContact),
          const Divider(),
          _Fact(
              label: 'Membership number',
              value: PrototypeData.membershipNumber),
          const SizedBox(height: NiaTokens.s6),

          const SectionLabel('Your standing'),
          const FdPlaceholder(
            code: 'Q2',
            label:
                'Whether the Member’s lifecycle state (Member / Paused / Closed) is shown to him, and how, is an open Product debate — predictability vs dignity. Not shown until decided.',
          ),
          const SizedBox(height: NiaTokens.s3),
          const FdPlaceholder(
            code: 'FD-5',
            label:
                'Tenure begins on the first Saturday (FD-3, resolved). How it behaves while Paused, and any maximum pause before closure, are undecided.',
          ),
          const SizedBox(height: NiaTokens.s6),

          const SectionLabel('Your data — yours'),
          Text(
            'You own your data. Nia is the custodian, not the owner. You can see your full history, and every time anyone else looks at it.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: NiaTokens.s5),
          // FD-7 resolved: consent is an event, not a setting — per-request,
          // default no, no standing authorization. The Member decides each time.
          Text('You decide every time.', style: theme.textTheme.titleLarge),
          const SizedBox(height: NiaTokens.s2),
          Text(
            'When an employer, recruiter, or anyone outside Nia asks for your information, we ask you first — by name, for that one request. You answer. Then the permission ends. Nothing is shared by default, and no one keeps standing access.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: NiaTokens.s4),
          OutlinedButton(
            onPressed: () => prototypeNoOp(context, 'See who accessed my data'),
            child: const Text('See who has accessed my data'),
          ),
          const SizedBox(height: NiaTokens.s5),
          const FdPlaceholder(
            code: 'FD-11',
            label:
                'What is concretely higher for women Members (dignity, safety, privacy floors — Book II §1.1) is undecided.',
          ),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 150,
            child: Text(label, style: theme.textTheme.bodyMedium),
          ),
          Expanded(child: Text(value, style: theme.textTheme.bodyLarge)),
        ],
      ),
    );
  }
}
