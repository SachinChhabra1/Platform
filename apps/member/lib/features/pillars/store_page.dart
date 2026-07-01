import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import 'pillar_kit.dart';

/// Store · Keep more. Promise: keep more. Reality: savings today, this month and
/// year. Opportunity: the voucher and smart swaps found by RafiQi. Supporting:
/// the essentials basket at member prices. Contribution: higher savings that
/// appear in NiaBook. Built on the shared [PillarScaffold].
class StorePage extends StatelessWidget {
  const StorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return PillarScaffold(
      pillar: 'Store',
      promise: 'Keep more',
      promiseSub: 'Lower prices. Higher savings.',
      body: <PillarBlock>[
        PillarBlock(PillarSection.reality, _todaySavings()),
        PillarBlock(PillarSection.opportunity, _voucher()),
        PillarBlock(PillarSection.supporting, _essentials(context)),
        PillarBlock(PillarSection.reality, _stats()),
        PillarBlock(PillarSection.opportunity, _swaps()),
      ],
      contribution: niaBookStrip(
          'This adds to your NiaBook', 'Higher savings. More for you.'),
    );
  }

  Widget _todaySavings() => niaCard(
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.shopping_bag_outlined),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  capsLabel("TODAY'S SAVINGS", color: NiaTokens.inkSecondary),
                  const Text('₹185',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.ink)),
                  const Text('saved today',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: NiaTokens.inkSecondary),
          ],
        ),
      );

  Widget _voucher() => niaCard(
        child: Row(
          children: <Widget>[
            niaIconChip(Icons.card_giftcard),
            const SizedBox(width: NiaTokens.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  capsLabel('SUKH VOUCHER', color: NiaTokens.inkSecondary),
                  const Text('₹500',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.blue)),
                  const Text('available',
                      style: TextStyle(
                          fontSize: 12, color: NiaTokens.inkSecondary)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: const <Widget>[
                Text('Use',
                    style: TextStyle(fontSize: 11, color: NiaTokens.inkSecondary)),
                Text('30 July',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: NiaTokens.ink)),
              ],
            ),
          ],
        ),
      );

  Widget _essentials(BuildContext context) => niaCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text('Essentials you buy',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: NiaTokens.ink)),
            const SizedBox(height: NiaTokens.s3),
            Row(
              children: <Widget>[
                Expanded(flex: 5, child: capsLabel('ITEM', color: NiaTokens.inkSecondary)),
                Expanded(flex: 3, child: _capsRight('MARKET')),
                Expanded(flex: 2, child: _capsRight('SUKH')),
                Expanded(flex: 3, child: _capsRight('YOU SAVE')),
              ],
            ),
            const SizedBox(height: NiaTokens.s2),
            _essRow('Rice (5kg)', '₹265', '₹225', '₹40'),
            _essRow('Sunflower oil (1L)', '₹162', '₹139', '₹23'),
            _essRow('Toilet soap', '₹45', '₹38', '₹7'),
            _essRow('Toothpaste', '₹120', '₹98', '₹22'),
            const SizedBox(height: NiaTokens.s2),
            niaHairline(),
            const SizedBox(height: NiaTokens.s2),
            Row(
              children: <Widget>[
                const Expanded(
                  child: Text("Today's basket — you kept ₹63",
                      style:
                          TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
                ),
                niaLink(context, 'See more'),
              ],
            ),
          ],
        ),
      );

  Widget _capsRight(String s) => Align(
      alignment: Alignment.centerRight,
      child: capsLabel(s, color: NiaTokens.inkSecondary));

  Widget _essRow(String item, String market, String sukh, String save) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          children: <Widget>[
            Expanded(
                flex: 5,
                child: Text(item,
                    style: const TextStyle(fontSize: 12, color: NiaTokens.ink))),
            Expanded(
              flex: 3,
              child: Text(market,
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                      fontSize: 12,
                      color: NiaTokens.inkSecondary,
                      decoration: TextDecoration.lineThrough)),
            ),
            Expanded(
              flex: 2,
              child: Text(sukh,
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: NiaTokens.ink)),
            ),
            Expanded(
              flex: 3,
              child: Text(save,
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: NiaTokens.blue)),
            ),
          ],
        ),
      );

  Widget _stats() => IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Expanded(child: statCard('THIS MONTH', '₹185', 'saved')),
            const SizedBox(width: NiaTokens.s3),
            Expanded(child: statCard('THIS YEAR', '₹2,460', 'saved')),
          ],
        ),
      );

  Widget _swaps() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          foundByRafiqi('Smart swaps'),
          const SizedBox(height: NiaTokens.s1),
          niaListRow(Icons.swap_horiz, 'Nia Essentials soap',
              'instead of Lifebuoy',
              trailing: '+₹10/mo'),
          niaHairline(),
          niaListRow(Icons.swap_horiz, 'Aashirvaad salt', 'instead of Tata Salt',
              trailing: '+₹5/mo'),
          niaHairline(),
          niaListRow(Icons.swap_horiz, 'Paracetamol 500 (generic)',
              'instead of Crocin',
              trailing: '+₹15/mo'),
        ],
      );
}
