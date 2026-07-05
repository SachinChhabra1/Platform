/// Work · Earn more — how to earn more next month. Warm NiaBook design (v0
/// prototype, migrated 2026-07-05): the contract + wage guarantee (reality), the
/// week's shifts and documents (supporting), upskilling (opportunity), and the
/// better-paying jobs RafiQi found (opportunity). Opens on the NiaBook strip so
/// the pillar always points home — Work's hours and overtime become what the
/// Member kept.
///
/// There is no Work backend contract yet, so this screen is sample-only (no live
/// ApiSource, no async states); it becomes live when a work read-model lands.
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../niabook/niabook_scenario.dart' show formatPaise;
import 'warm_pillar_kit.dart';

class WorkPage extends StatelessWidget {
  const WorkPage({super.key});

  @override
  Widget build(BuildContext context) {
    return WarmScreen(
      title: 'Work',
      subtitle: 'Earn more, grow your NiaBook',
      children: <Widget>[
        const NiaBookStrip(note: 'Your 176 hours and overtime added +₹2,500 to what you kept.'),
        _contract(),
        _wageGuarantee(),
        _shifts(),
        _documents(context),
        _upskilling(context),
        _earnMore(context),
      ],
    );
  }

  // ── Contract + this month ──────────────────────────────────────────────────
  Widget _contract() => WarmCard(
        child: Column(
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(color: NiaTokens.homeSecondary, shape: BoxShape.circle),
                  child: const Icon(Icons.work_outline, size: 18, color: NiaTokens.homeMuted),
                ),
                const SizedBox(width: NiaTokens.s3),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text('Prestige Constructions Pvt Ltd', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                      Text('Contract · Active', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                    ],
                  ),
                ),
                const WarmStatusPill('Protected', tone: WarmTone.positive, icon: Icons.verified_user_outlined),
              ],
            ),
            const SizedBox(height: NiaTokens.s4),
            const WarmDivider(),
            const SizedBox(height: NiaTokens.s4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(child: WarmStat(label: 'Monthly wage', value: formatPaise(1830000))),
                const Expanded(child: WarmStat(label: 'This month', value: '176 hrs', sub: '+8 overtime', subTone: WarmTone.positive)),
                const Expanded(child: WarmStat(label: 'Next pay', value: '5 days', sub: '1 Aug')),
              ],
            ),
          ],
        ),
      );

  // ── Wage guarantee ─────────────────────────────────────────────────────────
  Widget _wageGuarantee() => WarmCard(
        child: Row(
          children: <Widget>[
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: NiaTokens.homePrimary.withValues(alpha: 0.12), shape: BoxShape.circle),
              child: const Icon(Icons.verified_user_outlined, size: 18, color: NiaTokens.homePrimary),
            ),
            const SizedBox(width: NiaTokens.s3),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text('Your wage is guaranteed', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                  SizedBox(height: 2),
                  Text('Nia holds your employer accountable. If pay is late, we cover it and chase them.',
                      style: TextStyle(fontSize: 12, height: 1.4, color: NiaTokens.homeMuted)),
                ],
              ),
            ),
          ],
        ),
      );

  // ── Shifts ─────────────────────────────────────────────────────────────────
  Widget _shifts() {
    const rows = <(String, String, String, WarmTone)>[
      ('Today', '7:00 – 16:00 · Prestige Tech Park', 'Logged', WarmTone.positive),
      ('Tomorrow', '7:00 – 16:00 · Prestige Tech Park', 'Scheduled', WarmTone.info),
      ('Thu', 'Rest day', 'Off', WarmTone.neutral),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const WarmSectionTitle('Your shifts', action: 'This week'),
        WarmCard(
          padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
          child: Column(
            children: <Widget>[
              for (int i = 0; i < rows.length; i++) ...<Widget>[
                if (i > 0) const WarmDivider(),
                WarmListRow(
                  icon: Icons.schedule,
                  title: rows[i].$1,
                  subtitle: rows[i].$2,
                  trailing: WarmStatusPill(rows[i].$3, tone: rows[i].$4),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  Widget _documents(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const WarmSectionTitle('Documents', action: 'All safe'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                const WarmListRow(
                  icon: Icons.description_outlined,
                  title: 'Work permit',
                  subtitle: 'Valid until Mar 2027',
                  trailing: WarmStatusPill('Valid', tone: WarmTone.positive),
                ),
                const WarmDivider(),
                WarmListRow(
                  icon: Icons.description_outlined,
                  title: 'Employment contract',
                  subtitle: 'Signed · English + Hindi',
                  onTap: () => prototypeNoOp(context, 'Employment contract'),
                ),
                const WarmDivider(),
                const WarmListRow(
                  icon: Icons.description_outlined,
                  title: 'Health insurance',
                  subtitle: 'Renews in 42 days',
                  trailing: WarmStatusPill('Renew soon', tone: WarmTone.caution),
                ),
              ],
            ),
          ),
        ],
      );

  // ── Upskilling ─────────────────────────────────────────────────────────────
  Widget _upskilling(BuildContext context) {
    const skills = <(String, String, double)>[
      ('Scaffolding Safety L2', '3 of 5 modules done', 0.60),
      ('Spoken English', 'Daily 10-min lessons', 0.35),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const WarmSectionTitle('Grow your earning', action: 'See courses'),
        for (int i = 0; i < skills.length; i++) ...<Widget>[
          if (i > 0) const SizedBox(height: NiaTokens.s3),
          WarmCard(
            child: Column(
              children: <Widget>[
                WarmListRow(
                  icon: Icons.school_outlined,
                  title: skills[i].$1,
                  subtitle: skills[i].$2,
                  onTap: () => prototypeNoOp(context, skills[i].$1),
                ),
                const SizedBox(height: NiaTokens.s3),
                WarmProgressBar(skills[i].$3),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ── Earn more (the opportunity RafiQi found) ────────────────────────────────
  Widget _earnMore(BuildContext context) => Material(
        color: NiaTokens.homeInk,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => prototypeNoOp(context, 'Better-paying jobs'),
          child: Padding(
            padding: const EdgeInsets.all(NiaTokens.s4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(color: NiaTokens.homeGround.withValues(alpha: 0.15), shape: BoxShape.circle),
                      child: const Icon(Icons.trending_up, size: 18, color: NiaTokens.homeGround),
                    ),
                    const SizedBox(width: NiaTokens.s3),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text('3 better-paying jobs match you', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeGround)),
                          Text('Verified employers · +₹4,000/mo average', style: TextStyle(fontSize: 12, color: Color(0xB3F6F3EC))),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right, size: 16, color: NiaTokens.homeGround.withValues(alpha: 0.7)),
                  ],
                ),
                const SizedBox(height: NiaTokens.s3),
                const WarmWhyNow('These roles start hiring after this month — apply before the window closes.', onDark: true),
              ],
            ),
          ),
        ),
      );
}
