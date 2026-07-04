import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'nia_components.dart';
import 'pillar_kit.dart';

/// Living · Spend less. Promise: spend less. Reality: the studio and this
/// month's cost. Supporting: nest, meals, community, safety, services — each
/// framed as what it does for the Member, not a facility. Opportunity: a cheaper
/// path found by RafiQi. Contribution: lower cost and hours back that feed
/// NiaBook. Product-locked; built to the approved screen on shared components.
class LivingPage extends StatelessWidget {
  const LivingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return NiaReveal(
      // Living: calm, spacious, reassuring — gentle motion, airier rhythm (Q8).
      duration: const Duration(milliseconds: 460),
      child: PillarScaffold(
        pillar: 'Living',
        promise: 'Spend less',
        promiseSub: 'Lower, predictable living costs.',
        blockGap: NiaTokens.s5,
        body: <PillarBlock>[
          PillarBlock(PillarSection.reality, _studio()),
          PillarBlock(PillarSection.reality, _cost()),
          PillarBlock(PillarSection.supporting, _services(context)),
          const PillarBlock(
            PillarSection.opportunity,
            OpportunityCard(
              foundLabel: 'More you can keep',
              icon: Icons.local_laundry_service_outlined,
              title: "Laundry's included — skip the wash",
              subtitle: 'Log a Sunday overtime shift instead',
              gain: '+₹800',
              tag: 'Work',
            ),
          ),
        ],
        contribution: const SummaryCard(
          title: 'This month you kept ₹550 by living here',
          subtitle: 'Plus ~14 hours back — time to earn · Feeds your NiaBook',
        ),
        coaching: const CoachingLine(
          fact: "You've kept ₹550 living here.",
          next: "laundry's included — log a Sunday shift instead (+₹800).",
        ),
      ),
    );
  }

  Widget _studio() => InfoCard(
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

  Widget _cost() => InfoCard(
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
                Expanded(
                    child: iconTile(Icons.bolt_outlined, 'Electricity', 'Included',
                        statusColor: NiaTokens.blue)),
                Expanded(
                    child: iconTile(Icons.water_drop_outlined, 'Water', 'Included',
                        statusColor: NiaTokens.blue)),
                Expanded(
                    child: iconTile(Icons.wifi, 'Wi-Fi', '≈₹250',
                        statusColor: NiaTokens.blue)),
                Expanded(
                    child: iconTile(Icons.local_laundry_service_outlined,
                        'Laundry', '≈₹300',
                        statusColor: NiaTokens.blue)),
              ],
            ),
          ],
        ),
      );

  Widget _services(BuildContext context) => InfoCard(
        padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
        child: Column(
          children: <Widget>[
            ListRow(
              icon: Icons.bed_outlined,
              title: 'Your Nest',
              subtitle: 'Rest well. Work better tomorrow.',
              trailing: 'Included',
              trailingColor: NiaTokens.blue,
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Your Nest'),
            ),
            niaHairline(),
            ListRow(
              icon: Icons.restaurant_outlined,
              title: 'Meals',
              subtitle: 'No cooking. More time and energy.',
              trailing: 'Included',
              trailingColor: NiaTokens.blue,
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Meals'),
            ),
            niaHairline(),
            ListRow(
              icon: Icons.groups_outlined,
              title: 'Community',
              subtitle: 'Meet workers. Hear of better jobs.',
              trailing: 'Included',
              trailingColor: NiaTokens.blue,
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Community'),
            ),
            niaHairline(),
            ListRow(
              icon: Icons.shield_outlined,
              title: 'Safety & security',
              subtitle: 'Family worries less. Stay focused.',
              trailing: 'Included',
              trailingColor: NiaTokens.blue,
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Safety & security'),
            ),
            niaHairline(),
            ListRow(
              icon: Icons.build_outlined,
              title: 'Services',
              subtitle: 'Clean Nest after every shift. Recover faster.',
              trailing: 'Included',
              trailingColor: NiaTokens.blue,
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Services'),
            ),
            niaHairline(),
            ListRow(
              icon: Icons.chat_bubble_outline,
              title: 'Service requests',
              subtitle: 'Resolved fast. Back to work.',
              trailing: '0',
              showChevron: true,
              onTap: () => prototypeNoOp(context, 'Service requests'),
            ),
          ],
        ),
      );
}
