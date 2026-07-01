import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import 'pillar_kit.dart';

/// Work · Earn more. Promise: earn more. Reality: current job, pay, attendance.
/// Opportunity: a higher-paying certified role. Supporting: better jobs, skill
/// progress. Contribution: higher wages, voucher, savings, home. Built on the
/// shared [PillarScaffold]; layout follows the approved deck screen.
class WorkPage extends StatelessWidget {
  const WorkPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PillarScaffold(
      pillar: 'Work',
      promise: 'Earn more',
      promiseSub: 'Your next opportunity is waiting.',
      body: <PillarBlock>[
        PillarBlock(PillarSection.opportunity, _hero(context)),
        PillarBlock(PillarSection.reality, _reality()),
        PillarBlock(PillarSection.supporting, _betterJobs(context)),
        PillarBlock(PillarSection.supporting, _skillProgress()),
      ],
      contribution: _improves(),
    );
  }

  Widget _hero(BuildContext context) => niaCard(
        hero: true,
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.trending_up, filled: true),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text.rich(TextSpan(children: <InlineSpan>[
                    const TextSpan(
                        text: '+₹2,500',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: NiaTokens.blue)),
                    const TextSpan(
                        text: '/month available',
                        style: TextStyle(
                            fontSize: 12, color: NiaTokens.inkSecondary)),
                  ])),
                  const Text('Machine Operator II',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: NiaTokens.ink)),
                  const Text('Complete certification',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: NiaTokens.inkSecondary),
          ],
        ),
      );

  Widget _reality() => Column(
        children: <Widget>[
          niaCard(
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

  Widget _betterJobs(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          sectionTitle('Better jobs waiting',
              trailing: niaLink(context, 'See all')),
          const SizedBox(height: NiaTokens.s1),
          niaListRow(Icons.work_outline, 'Machine Operator II',
              'After certification',
              trailing: '+₹2,500/mo'),
          niaHairline(),
          niaListRow(Icons.work_outline, 'Line Supervisor', 'With experience',
              trailing: '+₹4,800/mo'),
          niaHairline(),
          niaListRow(Icons.work_outline, 'Quality Inspector',
              'After certification',
              trailing: '+₹3,600/mo'),
        ],
      );

  Widget _skillProgress() => niaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.school_outlined, size: 18, color: NiaTokens.blue),
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
            const Text('20 minutes left',
                style: TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
          ],
        ),
      );

  Widget _improves() => niaCard(
        grey: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            capsLabel('This improves your NiaBook'),
            const SizedBox(height: NiaTokens.s3),
            Row(
              children: <Widget>[
                Expanded(child: iconTile(Icons.savings_outlined, 'Higher wages', '')),
                Expanded(
                    child: iconTile(Icons.card_giftcard, '+₹500 voucher', '')),
                Expanded(
                    child:
                        iconTile(Icons.shopping_bag_outlined, 'More savings', '')),
                Expanded(child: iconTile(Icons.home_outlined, 'More home', '')),
              ],
            ),
          ],
        ),
      );
}
