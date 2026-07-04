import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'nia_components.dart';
import 'pillar_kit.dart';

/// Work · Earn more. Promise: earn more — one promise, nothing else. Opportunity:
/// a higher-paying certified role, found by RafiQi — the hero of the screen.
/// Reality: the current job, next pay, attendance. Supporting: better jobs and
/// certification progress. Contribution: the economic chain that lands in NiaBook
/// (certification → +₹2,000 wages → +₹500 Sukh voucher → more savings). Every row
/// leads with what the Member gains, is tappable, and is labelled for a screen
/// reader. Product-locked; built to the approved screen on shared components.
class WorkPage extends StatelessWidget {
  const WorkPage({super.key});

  @override
  Widget build(BuildContext context) {
    return NiaReveal(
      // Work: precise, energetic, purposeful — snappy motion, denser rhythm (Q8).
      duration: const Duration(milliseconds: 240),
      child: PillarScaffold(
        pillar: 'Work',
        promise: 'Earn more',
        promiseSub: 'A higher-paying role is one certification away.',
        blockGap: NiaTokens.s3,
        body: <PillarBlock>[
          PillarBlock(PillarSection.opportunity, _hero(context)),
          PillarBlock(PillarSection.reality, _reality()),
          PillarBlock(PillarSection.supporting, _betterJobs(context)),
          PillarBlock(PillarSection.supporting, _skillProgress()),
        ],
        contribution: const SummaryCard(
          title: 'Certify, and you keep ₹2,500 more every month',
          subtitle:
              '+₹2,000 wages · +₹500 Sukh voucher → more savings → your NiaBook',
        ),
        coaching: const CoachingLine(
          fact: "You've worked 21 of 22 days this month.",
          next: '20 minutes of training left — then +₹2,500/month.',
        ),
      ),
    );
  }

  /// The hero: the primary opportunity, found by RafiQi. Blue-bordered, tappable,
  /// and labelled — the +₹2,500/month role that opens the whole screen.
  Widget _hero(BuildContext context) => Semantics(
        button: true,
        label: 'Higher-paying role found by RafiQi. Machine Operator II, '
            'plus ₹2,500 a month once you certify. 20 minutes left.',
        excludeSemantics: true,
        child: InkWell(
          onTap: () => prototypeNoOp(context, 'Machine Operator II'),
          borderRadius: BorderRadius.circular(NiaTokens.radius),
          child: InfoCard(
            style: CardStyle.hero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                foundByRafiqi('Higher-paying role'),
                const SizedBox(height: NiaTokens.s3),
                Row(
                  children: <Widget>[
                    niaIconChip(Icons.trending_up, filled: true),
                    const SizedBox(width: NiaTokens.s3),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text.rich(TextSpan(children: const <InlineSpan>[
                            TextSpan(
                                text: '+₹2,500',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: NiaTokens.blue)),
                            TextSpan(
                                text: '/month more',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: NiaTokens.inkSecondary)),
                          ])),
                          const Text('Machine Operator II',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: NiaTokens.ink)),
                          const Text('Certify to unlock — 20 minutes left',
                              style: TextStyle(
                                  fontSize: 12, color: NiaTokens.inkSecondary)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right,
                        color: NiaTokens.inkSecondary),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

  /// Reality: today's job and pay. Grounding, not judgement — the base the
  /// opportunity lifts you from.
  Widget _reality() => Column(
        children: <Widget>[
          InfoCard(
            child: Row(
              children: <Widget>[
                niaIconChip(Icons.work_outline),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      capsLabel('CURRENT JOB', color: NiaTokens.inkSecondary),
                      const Text('Machine Operator',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: NiaTokens.ink)),
                      const Text('TVS Hosur',
                          style: TextStyle(
                              fontSize: 12, color: NiaTokens.inkSecondary)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: const <Widget>[
                    Text('₹22,400',
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: NiaTokens.ink)),
                    Text('per month',
                        style: TextStyle(
                            fontSize: 12, color: NiaTokens.inkSecondary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: NiaTokens.s3),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Expanded(
                    child: statCard('NEXT PAY', '₹8,200', 'Friday, 4 July')),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                    child: statCard(
                        'ATTENDANCE', '21 / 22', 'One more shift +₹850')),
              ],
            ),
          ),
        ],
      );

  /// Supporting: the ladder above this job. Every row leads with the gain and is
  /// tappable, wrapped like Living's services card.
  Widget _betterJobs(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SectionHeader('Better jobs waiting',
              trailing: niaLink(context, 'See all')),
          const SizedBox(height: NiaTokens.s2),
          InfoCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                ListRow(
                  icon: Icons.work_outline,
                  title: 'Machine Operator II',
                  subtitle: 'After your certification',
                  trailing: '+₹2,500/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () => prototypeNoOp(context, 'Machine Operator II'),
                ),
                niaHairline(),
                ListRow(
                  icon: Icons.work_outline,
                  title: 'Line Supervisor',
                  subtitle: "With two years' experience",
                  trailing: '+₹4,800/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () => prototypeNoOp(context, 'Line Supervisor'),
                ),
                niaHairline(),
                ListRow(
                  icon: Icons.work_outline,
                  title: 'Quality Inspector',
                  subtitle: 'One certification away',
                  trailing: '+₹3,600/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () => prototypeNoOp(context, 'Quality Inspector'),
                ),
              ],
            ),
          ),
        ],
      );

  /// Supporting: the path to the hero. Progress toward the certification that
  /// unlocks +₹2,500/month.
  Widget _skillProgress() => InfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.school_outlined,
                    size: 18, color: NiaTokens.blue),
                const SizedBox(width: NiaTokens.s2),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      capsLabel('SKILL PROGRESS',
                          color: NiaTokens.inkSecondary),
                      const Text('Machine Operator Certification',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: NiaTokens.ink)),
                    ],
                  ),
                ),
                const Text('75%',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: NiaTokens.blue)),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: const LinearProgressIndicator(
                value: 0.75,
                minHeight: 6,
                backgroundColor: NiaTokens.surfaceGrey,
                valueColor: AlwaysStoppedAnimation<Color>(NiaTokens.blue),
              ),
            ),
            const SizedBox(height: NiaTokens.s2),
            const Text('20 minutes left — then +₹2,500/month is yours',
                style: TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
          ],
        ),
      );
}
