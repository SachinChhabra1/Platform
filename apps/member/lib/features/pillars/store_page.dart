import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'nia_components.dart';
import 'pillar_kit.dart';

/// Store · Keep more. Not commerce — money kept. The screen is the flywheel made
/// visible without explanation: the Sukh voucher (the fuel, hero) → the basket
/// (what you kept, every SKU answering "how much did I keep?") → smart swaps
/// (keep even more) → savings compounding (today → month → year) → the literal
/// close (₹185 moved into your NiaBook). The hero is always money, never a
/// product; the saving always reads stronger than the price. Product-locked;
/// built to the approved screen on shared components.
class StorePage extends StatelessWidget {
  const StorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return NiaReveal(
      // Store: satisfying, brisk — standard rhythm, motion between Work and Living (Q8).
      duration: const Duration(milliseconds: 340),
      child: PillarScaffold(
        pillar: 'Store',
        promise: 'Keep more',
        promiseSub: 'Every basket keeps more of your money.',
        body: <PillarBlock>[
          PillarBlock(PillarSection.opportunity, _voucher(context)),
          PillarBlock(PillarSection.supporting, _basket(context)),
          PillarBlock(PillarSection.opportunity, _swaps(context)),
          PillarBlock(PillarSection.reality, _compounding()),
        ],
        contribution: const SummaryCard(
          title: 'This month, ₹185 moved into your NiaBook',
          subtitle: 'Today ₹63 · this year ₹2,460 — savings that compound',
        ),
        coaching: const CoachingLine(
          fact: 'You kept ₹185 this month.',
          next: 'use your ₹500 Sukh voucher before 30 July.',
        ),
      ),
    );
  }

  /// The hero: money, and the flywheel's fuel — the Sukh voucher waiting to be
  /// spent. Blue-bordered, tappable, screen-reader labelled.
  Widget _voucher(BuildContext context) => Semantics(
        button: true,
        label: '₹500 Sukh voucher waiting. Spend it at Sukh Store to keep more. '
            'Use by 30 July.',
        excludeSemantics: true,
        child: InkWell(
          onTap: () => prototypeNoOp(context, 'Sukh voucher'),
          borderRadius: BorderRadius.circular(NiaTokens.radius),
          child: InfoCard(
            style: CardStyle.hero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                foundByRafiqi('Sukh voucher'),
                const SizedBox(height: NiaTokens.s3),
                Row(
                  children: <Widget>[
                    niaIconChip(Icons.card_giftcard, filled: true),
                    const SizedBox(width: NiaTokens.s3),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text.rich(TextSpan(children: const <InlineSpan>[
                            TextSpan(
                                text: '₹500',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: NiaTokens.blue)),
                            TextSpan(
                                text: ' waiting',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: NiaTokens.inkSecondary)),
                          ])),
                          const Text('Sukh voucher',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: NiaTokens.ink)),
                          const Text('Spend at Sukh Store — use by 30 July',
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

  /// The basket: every SKU answers one question — how much did I keep? The kept
  /// amount is the strongest thing in the row; market and Sukh prices shrink to a
  /// quiet subline. Not "essentials you buy" — what you kept today.
  Widget _basket(BuildContext context) => InfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                capsLabel("TODAY'S BASKET", color: NiaTokens.inkSecondary),
                const Spacer(),
                capsLabel('YOU KEPT', color: NiaTokens.inkSecondary),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            _sku('Rice (5kg)', '₹265', '₹240', '₹25'),
            niaHairline(),
            _sku('Sunflower oil (1L)', '₹162', '₹147', '₹15'),
            niaHairline(),
            _sku('Toilet soap', '₹45', '₹37', '₹8'),
            niaHairline(),
            _sku('Toothpaste', '₹120', '₹105', '₹15'),
            const SizedBox(height: NiaTokens.s3),
            Container(
              padding: const EdgeInsets.all(NiaTokens.s3),
              decoration: BoxDecoration(
                color: NiaTokens.blueTint,
                borderRadius: BorderRadius.circular(NiaTokens.radius),
              ),
              child: Row(
                children: <Widget>[
                  const Expanded(
                    child: Text('You kept ₹63 on today’s basket',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: NiaTokens.blue)),
                  ),
                  niaLink(context, 'See basket'),
                ],
              ),
            ),
          ],
        ),
      );

  /// A single SKU row. The kept amount (blue, large, bold) dominates; the prices
  /// are a quiet line beneath the name, market struck through.
  Widget _sku(String item, String market, String sukh, String kept) => Semantics(
        label: '$item, you kept $kept. Market $market, Sukh $sukh.',
        excludeSemantics: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(item,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: NiaTokens.ink)),
                    Text.rich(TextSpan(
                        style: const TextStyle(
                            fontSize: 11, color: NiaTokens.inkSecondary),
                        children: <InlineSpan>[
                          const TextSpan(text: 'Market '),
                          TextSpan(
                              text: market,
                              style: const TextStyle(
                                  decoration: TextDecoration.lineThrough)),
                          TextSpan(text: '  ·  Sukh $sukh'),
                        ])),
                  ],
                ),
              ),
              const SizedBox(width: NiaTokens.s3),
              Text(kept,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: NiaTokens.blue)),
            ],
          ),
        ),
      );

  /// Smart swaps: more ways to keep, found by RafiQi. Tappable, benefit-led,
  /// wrapped like Work's better-jobs card.
  Widget _swaps(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SectionHeader('Keep even more', trailing: niaLink(context, 'See all')),
          const SizedBox(height: NiaTokens.s1),
          foundByRafiqi('Smart swaps'),
          const SizedBox(height: NiaTokens.s2),
          InfoCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                ListRow(
                  icon: Icons.swap_horiz,
                  title: 'Nia Essentials soap',
                  subtitle: 'Same clean, instead of Lifebuoy',
                  trailing: '+₹10/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () => prototypeNoOp(context, 'Nia Essentials soap'),
                ),
                niaHairline(),
                ListRow(
                  icon: Icons.swap_horiz,
                  title: 'Aashirvaad salt',
                  subtitle: 'Instead of Tata Salt',
                  trailing: '+₹5/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () => prototypeNoOp(context, 'Aashirvaad salt'),
                ),
                niaHairline(),
                ListRow(
                  icon: Icons.swap_horiz,
                  title: 'Paracetamol 500 (generic)',
                  subtitle: 'Same relief, instead of Crocin',
                  trailing: '+₹15/mo',
                  trailingColor: NiaTokens.blue,
                  showChevron: true,
                  onTap: () =>
                      prototypeNoOp(context, 'Paracetamol 500 (generic)'),
                ),
              ],
            ),
          ),
        ],
      );

  /// Savings, compounding — the thing only Store has. Today → this month → this
  /// year, the numbers growing down the ladder.
  Widget _compounding() => InfoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            capsLabel('SAVINGS, COMPOUNDING', color: NiaTokens.inkSecondary),
            const SizedBox(height: NiaTokens.s3),
            _ladder('Today', '₹63', 18),
            niaHairline(),
            _ladder('This month', '₹185', 18),
            niaHairline(),
            _ladder('This year', '₹2,460', 24),
          ],
        ),
      );

  Widget _ladder(String label, String value, double size) => Semantics(
        label: '$label, $value saved',
        excludeSemantics: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: <Widget>[
              Text(label,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: NiaTokens.ink)),
              const Spacer(),
              Text(value,
                  style: TextStyle(
                      fontSize: size,
                      fontWeight: FontWeight.w700,
                      color: NiaTokens.blue)),
              const SizedBox(width: 4),
              const Padding(
                padding: EdgeInsets.only(bottom: 2),
                child: Text('saved',
                    style:
                        TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
              ),
            ],
          ),
        ),
      );
}
