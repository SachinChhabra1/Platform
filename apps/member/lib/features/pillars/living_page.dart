import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import 'pillar_kit.dart';

/// Living · Spend less. Promise: spend less. Reality: the studio and this
/// month's cost. Supporting: nest, meals, community, safety, services.
/// Opportunity: a cheaper path found by RafiQi. Contribution: lower, predictable
/// costs that fund next month. Built on the shared [PillarScaffold].
class LivingPage extends StatelessWidget {
  const LivingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PillarScaffold(
      pillar: 'Living',
      promise: 'Spend less',
      promiseSub: 'Lower, predictable living costs.',
      body: <PillarBlock>[
        PillarBlock(PillarSection.reality, _studio()),
        PillarBlock(PillarSection.reality, _cost()),
        PillarBlock(PillarSection.supporting, _services(context)),
        PillarBlock(PillarSection.opportunity, _cheaperPath()),
      ],
      contribution: niaBookStrip('This month you kept ₹550 by living here',
          'Lower, predictable costs · Adds to your NiaBook'),
    );
  }

  // (RafiQi opportunity phrasing is shared in pillar_kit: foundByRafiqi.)

  Widget _studio() => niaCard(
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.apartment),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  capsLabel('YOUR STUDIO', color: NiaTokens.inkSecondary),
                  const Text('Umapathi Studio',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: NiaTokens.ink)),
                  const Text('Nest 204',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: const <Widget>[
                Text('31',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: NiaTokens.ink)),
                Text('days left',
                    style: TextStyle(fontSize: 11, color: NiaTokens.inkSecondary)),
                Text('in this stay',
                    style: TextStyle(fontSize: 11, color: NiaTokens.inkSecondary)),
              ],
            ),
          ],
        ),
      );

  Widget _cost() => niaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            capsLabel("THIS MONTH'S COST", color: NiaTokens.inkSecondary),
            const SizedBox(height: NiaTokens.s1),
            const Text('₹2,400',
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: NiaTokens.ink)),
            const Text('Everything included',
                style: TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
            const SizedBox(height: NiaTokens.s4),
            Row(
              children: <Widget>[
                Expanded(child: iconTile(Icons.bolt_outlined, 'Electricity', 'Included')),
                Expanded(child: iconTile(Icons.water_drop_outlined, 'Water', 'Included')),
                Expanded(child: iconTile(Icons.wifi, 'Wi-Fi', '≈₹250')),
                Expanded(
                    child: iconTile(
                        Icons.local_laundry_service_outlined, 'Laundry', '≈₹300')),
              ],
            ),
          ],
        ),
      );

  Widget _services(BuildContext context) => Column(
        children: <Widget>[
          niaListRow(Icons.bed_outlined, 'Your nest', 'Clean, comfortable, yours',
              chevron: true),
          niaHairline(),
          niaListRow(Icons.restaurant_outlined, 'Meals',
              'Nutritious meals, every day',
              chevron: true),
          niaHairline(),
          niaListRow(Icons.groups_outlined, 'Community',
              'People. Friends. Support.',
              chevron: true),
          niaHairline(),
          niaListRow(Icons.shield_outlined, 'Safety & security',
              '24x7 safety. We care.',
              chevron: true),
          niaHairline(),
          niaListRow(Icons.build_outlined, 'Services',
              'Housekeeping, maintenance',
              chevron: true),
          niaHairline(),
          niaListRow(Icons.chat_bubble_outline, 'Service requests',
              'Resolved quickly',
              trailing: '0', trailingColor: NiaTokens.inkSecondary, chevron: true),
        ],
      );

  Widget _cheaperPath() => niaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            foundByRafiqi('More you can keep'),
            const SizedBox(height: NiaTokens.s2),
            Row(
              children: <Widget>[
                niaIconChip(Icons.local_laundry_service_outlined),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const <Widget>[
                      Text("Laundry's included — skip the wash",
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: NiaTokens.ink)),
                      Text('Log a Sunday overtime shift instead',
                          style: TextStyle(
                              fontSize: 12, color: NiaTokens.inkSecondary)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: <Widget>[
                    const Text('+₹800',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: NiaTokens.blue)),
                    const SizedBox(height: 2),
                    pillarTag('Work'),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
}
