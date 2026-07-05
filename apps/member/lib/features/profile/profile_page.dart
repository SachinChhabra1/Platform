/// Me — the Member's identity, standing, Operator, phone, and data rights. Warm
/// NiaBook design (v0 prototype, migrated 2026-07-05).
///
/// Identity + standing are the ONE contract-backed part — wired LIVE via
/// [MembershipSource] through [NiaAsyncView] (loading / error+retry / success).
/// The locked product content is preserved: the calm standing copy for
/// Active/Paused/Closed, "this phone is your Nia phone" + recovery (spec 0002),
/// and data rights ("you decide every time", FD-7). Role / ID / home are sample
/// until a profile read-model lands; the shared blue MembershipHeader/MemberStanding
/// widgets are left untouched (other screens still use them).
library;

import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../../widgets/nia_async.dart';
import '../membership/membership_source.dart';
import '../pillars/warm_pillar_kit.dart';
import '../recovery/recovery_page.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({
    super.key,
    this.membershipSource = const SampleMembershipSource(),
    this.previewMode = false,
  });

  /// Live identity + standing over HTTP, or the offline sample (chosen by config).
  final MembershipSource membershipSource;

  /// Developer Preview: hide the remaining prototype FD markers. Offline keeps them.
  final bool previewMode;

  @override
  Widget build(BuildContext context) {
    return WarmScreen(
      title: 'Me',
      subtitle: 'Your Nia membership',
      children: <Widget>[
        _identity(context),
        _account(context),
        _protection(context),
        _operator(context),
        _details(),
        _niaPhone(context),
        _dataRights(context),
        _signOut(context),
      ],
    );
  }

  // ── Identity + standing (LIVE) ─────────────────────────────────────────────
  Widget _identity(BuildContext context) => WarmCard(
        child: NiaAsyncView<MembershipView>(
          load: membershipSource.currentMembership,
          loading: const SizedBox(height: 72, child: Center(child: CircularProgressIndicator(color: NiaTokens.homePrimary))),
          builder: (BuildContext context, MembershipView m) {
            final ({String title, String sub, bool active}) s = _standing(m.state);
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: NiaTokens.homePrimary,
                      child: Text(m.name.isNotEmpty ? m.name.substring(0, 1).toUpperCase() : 'R',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: NiaTokens.homeOnPrimary)),
                    ),
                    const SizedBox(width: NiaTokens.s4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(m.name.isEmpty ? 'Member' : m.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
                          const Text('Construction Helper', style: TextStyle(fontSize: 13, color: NiaTokens.homeMuted)),
                          const Text('ID · NIA-2291045', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: NiaTokens.s4),
                const WarmDivider(),
                const SizedBox(height: NiaTokens.s4),
                Text(s.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                const SizedBox(height: 2),
                Text(s.sub, style: const TextStyle(fontSize: 13, height: 1.4, color: NiaTokens.homeMuted)),
                if (!s.active) ...<Widget>[
                  const SizedBox(height: NiaTokens.s3),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Material(
                      color: NiaTokens.homePrimary,
                      borderRadius: BorderRadius.circular(999),
                      child: InkWell(
                        customBorder: const StadiumBorder(),
                        onTap: () => openOperatorSheet(context),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: NiaTokens.s4, vertical: NiaTokens.s2),
                          child: Text('Talk to your Operator', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: NiaTokens.homeOnPrimary)),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      );

  ({String title, String sub, bool active}) _standing(MembershipState state) => switch (state) {
        MembershipState.member => (title: 'An active Member of Nia', sub: 'Your membership is active and in good standing.', active: true),
        MembershipState.paused => (title: 'Your membership is paused', sub: 'Nothing of yours is lost. Your Operator can help you resume.', active: false),
        _ => (title: 'A Member of Nia', sub: 'Your Operator can help with your standing.', active: false),
      };

  // ── Account ────────────────────────────────────────────────────────────────
  Widget _account(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Account'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                WarmListRow(icon: Icons.description_outlined, title: 'My documents', subtitle: 'Permit, contract, insurance', onTap: () => prototypeNoOp(context, 'Documents')),
                const WarmDivider(),
                WarmListRow(icon: Icons.language, title: 'Language', subtitle: 'English · Hindi', onTap: () => prototypeNoOp(context, 'Language')),
                const WarmDivider(),
                WarmListRow(icon: Icons.notifications_outlined, title: 'Notifications', subtitle: 'Pay, deliveries, savings', onTap: () => prototypeNoOp(context, 'Notifications')),
              ],
            ),
          ),
        ],
      );

  // ── Protection & support ────────────────────────────────────────────────
  Widget _protection(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Protection & support'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                WarmListRow(icon: Icons.verified_user_outlined, title: 'Wage protection', subtitle: 'Active · guaranteed pay', onTap: () => prototypeNoOp(context, 'Wage protection')),
                const WarmDivider(),
                WarmListRow(icon: Icons.support_agent_outlined, title: 'Grievance help', subtitle: 'Report an issue confidentially', onTap: () => prototypeNoOp(context, 'Grievance help')),
                const WarmDivider(),
                WarmListRow(icon: Icons.call_outlined, title: '24/7 helpline', subtitle: 'In your language', onTap: () => prototypeNoOp(context, 'Helpline')),
              ],
            ),
          ),
        ],
      );

  // ── Your Operator ─────────────────────────────────────────────────────────
  Widget _operator(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Your Operator'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: WarmListRow(
              icon: Icons.person_outline,
              title: PrototypeData.operatorName,
              subtitle: PrototypeData.operatorStudio,
              trailing: IconButton(
                icon: const Icon(Icons.call_outlined, color: NiaTokens.homePrimary),
                tooltip: 'Call ${PrototypeData.operatorName}',
                onPressed: () => openOperatorSheet(context),
              ),
              onTap: () => openOperatorSheet(context),
            ),
          ),
        ],
      );

  // ── Details ────────────────────────────────────────────────────────────────
  Widget _details() => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Your details'),
          WarmCard(
            child: Column(
              children: <Widget>[
                _fact('Phone', PrototypeData.phoneMasked),
                const WarmDivider(),
                _fact('Home', PrototypeData.homePlace),
                const WarmDivider(),
                _fact('Language', PrototypeData.language),
              ],
            ),
          ),
        ],
      );

  Widget _fact(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3),
        child: Row(
          children: <Widget>[
            SizedBox(width: 120, child: Text(label, style: const TextStyle(fontSize: 13, color: NiaTokens.homeMuted))),
            Expanded(child: Text(value, style: const TextStyle(fontSize: 14, color: NiaTokens.homeInk))),
          ],
        ),
      );

  // ── Your Nia phone + recovery (spec 0002) ──────────────────────────────────
  Widget _niaPhone(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Your Nia phone'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: WarmListRow(
              icon: Icons.smartphone_outlined,
              title: 'This phone is your Nia phone',
              subtitle: 'Lost your phone? Here is how to get back in.',
              onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const RecoveryPage())),
            ),
          ),
        ],
      );

  // ── Your data — yours (FD-7) ────────────────────────────────────────────────
  Widget _dataRights(BuildContext context) => WarmCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text('YOUR DATA — YOURS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: NiaTokens.homeMuted)),
            const SizedBox(height: NiaTokens.s3),
            const Text('You decide every time.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
            const SizedBox(height: NiaTokens.s2),
            const Text(
              'When an employer, recruiter, or anyone outside Nia asks for your information, we ask you first — by name, for that one request. You answer. Then the permission ends. Nothing is shared by default.',
              style: TextStyle(fontSize: 13, height: 1.5, color: NiaTokens.homeMuted),
            ),
            const SizedBox(height: NiaTokens.s4),
            OutlinedButton(
              style: OutlinedButton.styleFrom(foregroundColor: NiaTokens.homePrimary, side: const BorderSide(color: NiaTokens.homeBorder)),
              onPressed: () => prototypeNoOp(context, 'See who accessed my data'),
              child: const Text('See who has accessed my data'),
            ),
            if (!previewMode) ...<Widget>[
              const SizedBox(height: NiaTokens.s4),
              const FdPlaceholder(
                code: 'FD-11',
                label: 'What is concretely higher for women Members (dignity, safety, privacy floors — Book II §1.1) is undecided.',
              ),
            ],
          ],
        ),
      );

  // ── Sign out ─────────────────────────────────────────────────────────────
  Widget _signOut(BuildContext context) => Center(
        child: TextButton.icon(
          style: TextButton.styleFrom(foregroundColor: NiaTokens.homeDanger),
          onPressed: () => prototypeNoOp(context, 'Sign out — the working revoke is the next slice (spec 0002 ERR-8)'),
          icon: const Icon(Icons.logout, size: 18),
          label: const Text('Sign out of this phone'),
        ),
      );
}
