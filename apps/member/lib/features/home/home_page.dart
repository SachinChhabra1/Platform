import 'package:flutter/material.dart';
import 'package:nia_api/api.dart';

import '../../prototype/prototype.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../membership/membership_source.dart';
import '../promise/promise_page.dart';
import '../wallet/wallet_overview_source.dart';
import '../wallet/wallet_page.dart' show formatRupees;

/// Membership Home — "the Home is the answer" (Book IV §3.1).
///
/// Order is fixed by Founder decision (2026-06-29): the first question a Member
/// asks is "how much do I have today?", so the **balance leads**. The Promise
/// explains the relationship; the balance proves it. Sequence:
///   1. Available balance · 2. What changed · 3. What next · 4. The Promise ·
///   5. Your life with Nia.
///
/// The greeting and the headline figures are **live**: the name comes from the
/// Membership read model and the two §3 figures from the Wallet Overview read
/// model, through the generated `nia_api` client ([MemberConfig]). With the
/// offline sample the numbers are identical to the Founder-accepted scenario, so
/// the prototype is unchanged; pointed at the backend (Developer Preview) the
/// Home shows the real services.
///
/// `previewMode` surfaces the Member's lifecycle **state** ("Active"). In the
/// offline prototype it stays OFF, preserving the Q2 placeholder below — whether
/// the state is shown to the Member is still an open Product debate; the Preview
/// lens leans toward showing it, for Founder confirmation.
class HomePage extends StatefulWidget {
  const HomePage({
    super.key,
    this.walletSource = const SampleWalletOverviewSource(),
    this.membershipSource = const SampleMembershipSource(),
    this.previewMode = false,
  });

  final WalletOverviewSource walletSource;
  final MembershipSource membershipSource;
  final bool previewMode;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final Future<MonthlyOverview> _overview = widget.walletSource.currentOverview();
  late final Future<MembershipView> _membership =
      widget.membershipSource.currentMembership();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s6, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
        // Addressed by name, never a number (Book III §6.3, Truth 1.7). "Namaste"
        // shows immediately; the name fills in from the live Membership model.
        FutureBuilder<MembershipView>(
          future: _membership,
          builder: (BuildContext context, AsyncSnapshot<MembershipView> snap) {
            final String? name = snap.data?.name;
            final String first =
                (name != null && name.isNotEmpty) ? name.split(' ').first : '';
            return Text(
              first.isEmpty ? 'Namaste' : 'Namaste, $first',
              style: theme.textTheme.headlineMedium,
            );
          },
        ),
        const SizedBox(height: NiaTokens.s2),

        // Lifecycle state — Preview only (Q2). A quiet, confident standing line.
        if (widget.previewMode)
          FutureBuilder<MembershipView>(
            future: _membership,
            builder: (BuildContext context, AsyncSnapshot<MembershipView> snap) {
              if (!snap.hasData) return const SizedBox(height: NiaTokens.s2);
              final _Standing s = _standingFor(snap.data!.state);
              return Padding(
                padding: const EdgeInsets.only(bottom: NiaTokens.s2),
                child: Row(
                  children: <Widget>[
                    Icon(s.icon, size: 16, color: s.color),
                    const SizedBox(width: NiaTokens.s2),
                    Flexible(
                      child: Text(s.phrase,
                          style: theme.textTheme.bodyMedium?.copyWith(color: s.color)),
                    ),
                  ],
                ),
              );
            },
          )
        else
          Text('Tuesday, a quiet day.', style: theme.textTheme.bodyMedium),
        const SizedBox(height: NiaTokens.s8),

        // 1 — The two §3 figures, live: what he can use now leads (the first
        // question), then what stayed his this month. Distinct numbers, kept apart.
        FutureBuilder<MonthlyOverview>(
          future: _overview,
          builder: (BuildContext context, AsyncSnapshot<MonthlyOverview> snap) {
            if (!snap.hasData) {
              return const SizedBox(
                height: 96,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              );
            }
            final MonthlyOverview o = snap.data!;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(formatRupees(o.availableBalance),
                    style: theme.textTheme.displaySmall),
                const SizedBox(height: NiaTokens.s1),
                Text('available in your Wallet', style: theme.textTheme.bodyMedium),
                const SizedBox(height: NiaTokens.s4),
                Text('${formatRupees(o.stayedThisMonth)} stayed with you this month',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(color: NiaTokens.inkSecondary)),
              ],
            );
          },
        ),
        const SizedBox(height: NiaTokens.s7),

        // 2 — What changed since he last looked.
        const SectionLabel('What changed'),
        const SizedBox(height: NiaTokens.s2),
        const _ChangeLine(
          color: NiaTokens.green,
          text: '₹5,000 sent home to Sunita — received.',
        ),
        const SizedBox(height: NiaTokens.s4),
        const _ChangeLine(
          color: NiaTokens.green,
          text: '₹2,000 moved to your savings.',
        ),
        const SizedBox(height: NiaTokens.s6),

        // 3 — What next — a quiet action, not a slab.
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

        // 4 — The Promise (Book I §4.19) — explains the relationship the balance
        // proves. Prominent typography, no card chrome; placed after the proof.
        _PromiseBlock(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const PromisePage()),
          ),
        ),
        const SizedBox(height: NiaTokens.s8),

        // 5 — Your life with Nia (Book IV §2.2) — parts of a life, not a menu.
        const SectionLabel('Your life with Nia'),
        const SizedBox(height: NiaTokens.s3),
        const _LifeRow(
          icon: Icons.bed_outlined,
          title: 'Where you sleep',
          detail: 'A bed in Peenya, Bengaluru',
        ),
        const _LifeRow(
          icon: Icons.work_outline,
          title: 'Your days at work',
          detail: 'Your shifts and what you earn',
        ),
        const _LifeRow(
          icon: Icons.local_mall_outlined,
          title: 'What you need',
          detail: 'Meals, phone, the daily things',
        ),
        const _LifeRow(
          icon: Icons.favorite_border,
          title: 'Your family',
          detail: 'Sunita, back home in Ganjam',
          marker: 'Q3',
        ),
        const SizedBox(height: NiaTokens.s5),
        // FD-3 resolved: tenure begins on the first Saturday (internal — one
        // birthday). Whether it is ever shown to the Member is Q4 (open), bounded
        // by the no-gamification ban (§6.3). No tenure number is surfaced.
        const FdPlaceholder(
          code: 'Q4',
          label:
              'Tenure begins on the first Saturday (FD-3, resolved) but stays internal. Whether it is ever shown to the Member — without becoming a streak (§6.3) — is undecided, so no tenure is surfaced here.',
        ),
      ],
    );
  }
}

/// How a lifecycle state reads on the Home standing line (Preview only).
class _Standing {
  const _Standing(this.phrase, this.icon, this.color);
  final String phrase;
  final IconData icon;
  final Color color;
}

_Standing _standingFor(MembershipState state) {
  switch (state) {
    case MembershipState.member:
      return const _Standing('An active Member of Nia', Icons.check_circle, NiaTokens.green);
    case MembershipState.paused:
      return const _Standing('A paused Member of Nia', Icons.pause_circle_outline, NiaTokens.amber);
    case MembershipState.prospective:
      return const _Standing('Joining Nia', Icons.schedule, NiaTokens.inkSecondary);
    case MembershipState.closed:
      return const _Standing('A former Member of Nia', Icons.circle_outlined, NiaTokens.inkSecondary);
    default:
      return const _Standing('A Member of Nia', Icons.circle_outlined, NiaTokens.inkSecondary);
  }
}

class _PromiseBlock extends StatelessWidget {
  const _PromiseBlock({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const SectionLabel('The Promise · this month'),
          const SizedBox(height: NiaTokens.s1),
          Text(
            'Your money is yours — and we keep it that way.',
            style: theme.textTheme.headlineMedium?.copyWith(height: 1.2),
          ),
          const SizedBox(height: NiaTokens.s3),
          Row(
            children: <Widget>[
              Text('Read The Promise',
                  style: theme.textTheme.bodyMedium
                      ?.copyWith(color: NiaTokens.ink)),
              const SizedBox(width: NiaTokens.s1),
              const Icon(Icons.arrow_forward, size: 15, color: NiaTokens.ink),
            ],
          ),
        ],
      ),
    );
  }
}

class _ChangeLine extends StatelessWidget {
  const _ChangeLine({required this.color, required this.text});

  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          margin: const EdgeInsets.only(top: 9),
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: NiaTokens.s3),
        Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyLarge)),
      ],
    );
  }
}

class _LifeRow extends StatelessWidget {
  const _LifeRow({
    required this.icon,
    required this.title,
    required this.detail,
    this.marker,
  });

  final IconData icon;
  final String title;
  final String detail;
  final String? marker;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon, size: 22, color: NiaTokens.inkSecondary),
          const SizedBox(width: NiaTokens.s4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: theme.textTheme.bodyLarge),
                const SizedBox(height: 2),
                Text(detail, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          if (marker != null)
            Padding(
              padding: const EdgeInsets.only(top: NiaTokens.s1),
              child: Text(marker!,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: NiaTokens.amber)),
            ),
        ],
      ),
    );
  }
}
