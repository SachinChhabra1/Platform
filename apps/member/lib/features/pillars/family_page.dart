import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'nia_components.dart';
import 'pillar_kit.dart';

/// Family · the emotional centre of the operating system. Not a remittance
/// screen, not payments, not insurance — care. Every block answers one question:
/// how are the people I left home for? The promise is "Take better care of home"
/// (the nav still reads Family). People come first, money second; goals are the
/// cross-pillar flywheel felt without explanation (Work · Store · Living cover a
/// school fee); protection reassures rather than sells. The close lands on
/// purpose, not finance — the only pillar whose flywheel closes emotionally.
/// Product-locked; built to the approved screen on shared components.
class FamilyPage extends StatelessWidget {
  const FamilyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return NiaReveal(
      // Family: warm, personal, hopeful — gentle motion, airier rhythm (Q8).
      duration: const Duration(milliseconds: 460),
      child: PillarScaffold(
        pillar: 'Family',
        promise: 'Take better care of home',
        promiseSub: 'How are the people you left home for?',
        blockGap: NiaTokens.s5,
        body: <PillarBlock>[
          PillarBlock(PillarSection.reality, _people(context)),
          PillarBlock(PillarSection.reality, _reachedHome()),
          PillarBlock(PillarSection.opportunity, _goal()),
          PillarBlock(PillarSection.supporting, _protection()),
        ],
        contribution: const SummaryCard(
          icon: Icons.favorite,
          title: 'The people you left home for are doing better',
          subtitle: 'Your NiaBook remembers every month you showed up',
        ),
        coaching: const CoachingLine(
          fact: '₹5,000 reached home, on time.',
          next: "Ravi's school fees (₹1,200) are due 15 July.",
        ),
      ),
    );
  }

  /// The hero: people, not money. The first thing a Member sees is that the ones
  /// they left home for are well. Warm monograms, each row tappable and labelled.
  Widget _people(BuildContext context) => InfoCard(
        padding: const EdgeInsets.symmetric(
            horizontal: NiaTokens.s4, vertical: NiaTokens.s2),
        child: Column(
          children: <Widget>[
            _person(context, 'A', 'Mother', 'Amma', 'Healthy'),
            niaHairline(),
            _person(context, 'A', 'Father', 'Appa', 'Healthy'),
            niaHairline(),
            _person(context, 'R', 'Ravi', 'Son · Class 6', 'Fees paid'),
          ],
        ),
      );

  Widget _person(BuildContext context, String initials, String name,
          String detail, String status) =>
      Semantics(
        button: true,
        label: '$name, $detail. $status.',
        excludeSemantics: true,
        child: InkWell(
          onTap: () => prototypeNoOp(context, name),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 56),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
              child: Row(
                children: <Widget>[
                  Monogram(initials: initials, size: 40),
                  const SizedBox(width: NiaTokens.s3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(name,
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: NiaTokens.ink)),
                        Text(detail,
                            style: const TextStyle(
                                fontSize: 12, color: NiaTokens.inkSecondary)),
                      ],
                    ),
                  ),
                  const Icon(Icons.check_circle, size: 18, color: NiaTokens.blue),
                  const SizedBox(width: 4),
                  Text(status,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: NiaTokens.ink)),
                ],
              ),
            ),
          ),
        ),
      );

  /// Money — only after people. One calm confirmation: it reached home, on time.
  Widget _reachedHome() => InfoCard(
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.volunteer_activism, filled: true),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text('₹5,000',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.ink)),
                  const Text('reached home this month',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            const Icon(Icons.check_circle, size: 18, color: NiaTokens.blue),
            const SizedBox(width: 4),
            const Text('On time',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: NiaTokens.ink)),
          ],
        ),
      );

  /// Goals — where Family becomes magical. A real goal (a school fee), and the
  /// ways it is already within reach — each one a different pillar quietly doing
  /// its job. The cross-pillar flywheel, felt without a diagram.
  Widget _goal() => InfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                niaIconChip(Icons.school_outlined),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const <Widget>[
                      Text("Ravi's school fees",
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
            foundByRafiqi('Covered by'),
            const SizedBox(height: NiaTokens.s2),
            _cover('Two overtime shifts', 'Work'),
            _cover('A Machine Operator promotion', 'Work'),
            _cover('Four months of Sukh savings', 'Store'),
          ],
        ),
      );

  Widget _cover(String title, String tag) => Semantics(
        label: '$title, from $tag',
        excludeSemantics: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
          child: Row(
            children: <Widget>[
              const Icon(Icons.check_circle, size: 18, color: NiaTokens.blue),
              const SizedBox(width: NiaTokens.s3),
              Expanded(
                child: Text(title,
                    style: const TextStyle(fontSize: 13, color: NiaTokens.ink)),
              ),
              pillarTag(tag),
            ],
          ),
        ),
      );

  /// Protection — never a product menu. The reassuring answer to one question:
  /// is my family protected? Yes.
  Widget _protection() => InfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text('Your family is protected',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: NiaTokens.ink)),
            const SizedBox(height: NiaTokens.s4),
            Row(
              children: <Widget>[
                Expanded(
                    child: iconTile(Icons.verified_user_outlined, 'Insurance',
                        'Active',
                        statusColor: NiaTokens.blue)),
                Expanded(
                    child: iconTile(Icons.medical_services_outlined, 'Medical',
                        'Covered',
                        statusColor: NiaTokens.blue)),
                Expanded(
                    child: iconTile(Icons.savings_outlined, 'Emergency fund',
                        'Ready',
                        statusColor: NiaTokens.blue)),
              ],
            ),
          ],
        ),
      );
}
