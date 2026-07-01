import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import 'pillar_kit.dart';

/// Family · Send more home. Promise: send more home. Reality: what reached home
/// this month. Supporting: family status, benefits and protection. Opportunity:
/// ways to meet an upcoming goal, found by RafiQi across pillars. Contribution:
/// more reaches home, family stays secure. Built on the shared [PillarScaffold].
/// This is the reason every other pillar exists.
class FamilyPage extends StatelessWidget {
  const FamilyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PillarScaffold(
      pillar: 'Family',
      promise: 'Send more home',
      promiseSub: 'Because they matter most.',
      body: <PillarBlock>[
        PillarBlock(PillarSection.reality, _reachedHome()),
        PillarBlock(PillarSection.supporting, _myFamily(context)),
        PillarBlock(PillarSection.supporting, _benefits()),
        PillarBlock(PillarSection.opportunity, _upcoming()),
      ],
      contribution: niaBookStrip('This adds to your NiaBook',
          'More reaches home. Family stays secure.'),
    );
  }

  Widget _reachedHome() => niaCard(
        hero: true,
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.favorite, filled: true),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  capsLabel('THIS MONTH', color: NiaTokens.inkSecondary),
                  const Text('₹5,000',
                      style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.ink)),
                  const Text('reached home',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: const <Widget>[
                Icon(Icons.check_circle, size: 22, color: NiaTokens.blue),
                SizedBox(height: 2),
                Text('On time',
                    style: TextStyle(fontSize: 11, color: NiaTokens.inkSecondary)),
              ],
            ),
          ],
        ),
      );

  Widget _myFamily(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          sectionTitle('My family', trailing: niaLink(context, 'See all')),
          const SizedBox(height: NiaTokens.s3),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Expanded(child: _member('Mother', 'Healthy')),
                const SizedBox(width: NiaTokens.s3),
                Expanded(child: _member('Father', 'Healthy')),
                const SizedBox(width: NiaTokens.s3),
                Expanded(child: _member('Son', 'School fees paid')),
              ],
            ),
          ),
        ],
      );

  Widget _member(String name, String status) => Container(
        padding: const EdgeInsets.symmetric(
            vertical: NiaTokens.s3, horizontal: NiaTokens.s2),
        decoration: BoxDecoration(
          color: NiaTokens.surfaceGrey,
          borderRadius: BorderRadius.circular(NiaTokens.radius),
        ),
        child: Column(
          children: <Widget>[
            Container(
              width: 34,
              height: 34,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                  color: NiaTokens.ground, shape: BoxShape.circle),
              child: const Icon(Icons.person_outline,
                  size: 18, color: NiaTokens.inkSecondary),
            ),
            const SizedBox(height: NiaTokens.s2),
            Text(name,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: NiaTokens.ink)),
            Text(status,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 11, color: NiaTokens.inkSecondary)),
          ],
        ),
      );

  Widget _benefits() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          sectionTitle('Benefits & protection'),
          const SizedBox(height: NiaTokens.s3),
          Row(
            children: <Widget>[
              Expanded(
                  child: iconTile(Icons.verified_user_outlined, 'Insurance', 'Active')),
              Expanded(
                  child: iconTile(Icons.add_circle_outline, 'Health', 'Covered')),
              Expanded(
                  child: iconTile(
                      Icons.health_and_safety_outlined, 'Accident', 'Covered')),
              Expanded(
                  child: iconTile(Icons.call_outlined, 'Tele-consult', 'Available')),
            ],
          ),
        ],
      );

  Widget _upcoming() => niaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            capsLabel('UPCOMING', color: NiaTokens.inkSecondary),
            const SizedBox(height: NiaTokens.s2),
            Row(
              children: <Widget>[
                niaIconChip(Icons.school_outlined),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const <Widget>[
                      Text('School fees',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: NiaTokens.ink)),
                      Text('Due 15 July',
                          style: TextStyle(
                              fontSize: 12, color: NiaTokens.inkSecondary)),
                    ],
                  ),
                ),
                const Text('₹1,200',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: NiaTokens.ink)),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            niaHairline(),
            const SizedBox(height: NiaTokens.s3),
            foundByRafiqi('Ways to cover this'),
            const SizedBox(height: NiaTokens.s2),
            _cover(Icons.work_outline, 'Two overtime shifts', 'Work'),
            _cover(Icons.trending_up, 'Machine Operator promotion', 'Work'),
            _cover(Icons.shopping_bag_outlined,
                '₹300 grocery savings × 4 months', 'Store'),
          ],
        ),
      );

  Widget _cover(IconData icon, String title, String tag) => Padding(
        padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 18, color: NiaTokens.blue),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Text(title,
                  style: const TextStyle(fontSize: 13, color: NiaTokens.ink)),
            ),
            pillarTag(tag),
          ],
        ),
      );
}
