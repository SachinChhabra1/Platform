import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../../widgets/nia_async.dart';
import '../membership/member_standing.dart';
import '../membership/membership_header.dart';
import '../membership/membership_source.dart';
import '../recovery/recovery_page.dart';

/// Profile — the Member's identity, his standing, his Operator, his phone, and
/// his data rights.
///
/// He is known by name, not number (Book III §6.3, Truth 1.7); he owns his data
/// and Nia is custodian (Article XV). His **standing** is shown (Q2 resolved,
/// Founder 2026-06-30) via [MemberStanding] — calm for Active, careful and
/// action-helpful for Paused/Closed. In the offline prototype the remaining open
/// markers (FD-11) are kept; in the Developer Preview (`previewMode`) they are
/// hidden so the screen reads as the product.
class ProfilePage extends StatefulWidget {
  const ProfilePage({
    super.key,
    this.membershipSource = const SampleMembershipSource(),
    this.previewMode = false,
  });

  /// Source for the identity header and the standing — live over HTTP or the
  /// offline sample, chosen by [MemberConfig] at the shell. Defaults to sample.
  final MembershipSource membershipSource;

  /// Developer Preview: hide the remaining prototype FD markers so the screen
  /// reads as the product. Offline (default) keeps them.
  final bool previewMode;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Body-only: renders as a tab under the shell's app bar (which supplies the
    // "Profile" title, the prototype/preview chip, and one-tap Operator access).
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
          // Identity header — wired to the Membership read model via nia_api.
          MembershipHeader(source: widget.membershipSource),
          const SizedBox(height: NiaTokens.s7),

          // Your standing (Q2 resolved) — the live lifecycle state, with careful
          // copy for Paused/Closed.
          const SectionLabel('Your standing'),
          const SizedBox(height: NiaTokens.s2),
          NiaAsyncView<MembershipView>(
            load: widget.membershipSource.currentMembership,
            loading: const SizedBox(height: 44),
            builder: (BuildContext context, MembershipView m) => MemberStanding(
              state: m.state,
              onOperator: () => openOperatorSheet(context),
            ),
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
          _Fact(label: 'Phone', value: PrototypeData.phoneMasked),
          const Divider(),
          _Fact(label: 'Home', value: PrototypeData.homePlace),
          const Divider(),
          _Fact(label: 'Language', value: PrototypeData.language),
          const Divider(),
          _Fact(
              label: 'Emergency contact',
              value: PrototypeData.emergencyContact),
          const SizedBox(height: NiaTokens.s6),

          // This phone is your Nia phone — and how to recover it (spec 0002).
          const SectionLabel('Your Nia phone'),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.smartphone_outlined, color: NiaTokens.ink),
            title: Text('This phone is your Nia phone',
                style: theme.textTheme.bodyLarge),
            subtitle: Text('Lost your phone? Here is how to get back in.',
                style: theme.textTheme.bodySmall),
            trailing: const Icon(Icons.chevron_right, color: NiaTokens.inkSecondary),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const RecoveryPage()),
            ),
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
          if (!widget.previewMode) ...<Widget>[
            const SizedBox(height: NiaTokens.s5),
            const FdPlaceholder(
              code: 'FD-11',
              label:
                  'What is concretely higher for women Members (dignity, safety, privacy floors — Book II §1.1) is undecided.',
            ),
          ],
          const SizedBox(height: NiaTokens.s8),

          // Sign out of this phone — the member-facing revoke (spec 0002 ERR-8).
          // The working revoke is Slice C; this previews the action.
          Center(
            child: TextButton.icon(
              style: TextButton.styleFrom(foregroundColor: NiaTokens.red),
              onPressed: () => _confirmSignOut(context),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Sign out of this phone'),
            ),
          ),
        ],
    );
  }

  Future<void> _confirmSignOut(BuildContext context) {
    final theme = Theme.of(context);
    return showModalBottomSheet<void>(
      context: context,
      backgroundColor: NiaTokens.ground,
      showDragHandle: true,
      builder: (BuildContext sheet) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(
              NiaTokens.s5, 0, NiaTokens.s5, NiaTokens.s7),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text('Sign out of this phone?', style: theme.textTheme.titleLarge),
              const SizedBox(height: NiaTokens.s3),
              Text(
                'This ends your session on this device. To sign back in you use '
                'your Nia phone again — and if you have lost it, your Operator '
                'helps you in person.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: NiaTokens.s5),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: NiaTokens.red,
                    padding: const EdgeInsets.symmetric(vertical: NiaTokens.s4),
                  ),
                  onPressed: () {
                    Navigator.of(sheet).pop();
                    prototypeNoOp(context,
                        'Sign out — the working revoke is the next slice (spec 0002 ERR-8)');
                  },
                  child: const Text('Sign out'),
                ),
              ),
            ],
          ),
        );
      },
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
