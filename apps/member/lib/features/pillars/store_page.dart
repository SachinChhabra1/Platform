/// Sukh Store · Save more — how to save more next month with certified member
/// prices. Warm NiaBook design (v0 prototype, migrated 2026-07-05): search, the
/// Nia-Certified trust banner, category chips, the "added to your NiaBook this
/// week" strip, and the product grid where every item leads with what it adds to
/// the Member's NiaBook. Opens on the NiaBook strip.
///
/// No Store backend contract yet, so sample-only (no live ApiSource / async
/// states); the catalogue becomes live when a store read-model lands.
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../niabook/niabook_scenario.dart' show formatPaise;
import 'warm_pillar_kit.dart';

/// One sample catalogue item (rupees; certified = Nia Label).
class _Item {
  const _Item(this.name, this.unit, this.price, this.market, this.icon, {this.certified = false});
  final String name;
  final String unit;
  final int price;
  final int market;
  final IconData icon;
  final bool certified;
  int get savedPct => (((market - price) / market) * 100).round();
}

const List<_Item> _items = <_Item>[
  _Item('Basmati Rice', '5 kg bag', 340, 470, Icons.rice_bowl_outlined, certified: true),
  _Item('Sunflower Cooking Oil', '1 L bottle', 140, 190, Icons.water_drop_outlined, certified: true),
  _Item('Red Lentils (Masoor Dal)', '2 kg pack', 180, 250, Icons.grain_outlined, certified: true),
  _Item('Bath Soap (6 pack)', '6 × 100g', 120, 175, Icons.soap_outlined),
];

const List<String> _categories = <String>['All', 'Groceries', 'Personal Care', 'Clothing', 'Electronics'];

class StorePage extends StatelessWidget {
  const StorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return WarmScreen(
      title: 'Sukh',
      subtitle: 'Save more, grow your NiaBook',
      children: <Widget>[
        const NiaBookStrip(note: 'Certified prices saved you ₹620 — straight into what you kept.'),
        _search(),
        _trustBanner(),
        _categoryChips(),
        _addedThisWeek(),
        _grid(context),
      ],
    );
  }

  Widget _search() => Container(
        padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s3, vertical: 12),
        decoration: BoxDecoration(color: NiaTokens.homeCard, borderRadius: BorderRadius.circular(NiaTokens.radius), border: Border.all(color: NiaTokens.homeBorder)),
        child: const Row(
          children: <Widget>[
            Icon(Icons.search, size: 16, color: NiaTokens.homeMuted),
            SizedBox(width: NiaTokens.s2),
            Text('Search groceries, care, more…', style: TextStyle(fontSize: 14, color: NiaTokens.homeMuted)),
          ],
        ),
      );

  Widget _trustBanner() => Container(
        padding: const EdgeInsets.all(NiaTokens.s4),
        decoration: BoxDecoration(
          color: NiaTokens.homeSecondary,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: NiaTokens.homePrimary.withValues(alpha: 0.25)),
        ),
        child: Row(
          children: <Widget>[
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: NiaTokens.homePrimary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
              child: const Icon(Icons.verified_outlined, size: 20, color: NiaTokens.homeOnPrimary),
            ),
            const SizedBox(width: NiaTokens.s3),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text('Every item Nia-Certified', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                  SizedBox(height: 2),
                  Text('Vetted against the 200-ingredient blacklist. No middleman, no ad auction.',
                      style: TextStyle(fontSize: 12, height: 1.4, color: NiaTokens.homeMuted)),
                ],
              ),
            ),
          ],
        ),
      );

  Widget _categoryChips() => SizedBox(
        height: 34,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: _categories.length,
          separatorBuilder: (_, _) => const SizedBox(width: NiaTokens.s2),
          itemBuilder: (_, i) {
            final bool active = i == 0;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: active ? NiaTokens.homePrimary : NiaTokens.homeCard,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: active ? NiaTokens.homePrimary : NiaTokens.homeBorder),
              ),
              child: Text(_categories[i],
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: active ? NiaTokens.homeOnPrimary : NiaTokens.homeMuted)),
            );
          },
        ),
      );

  Widget _addedThisWeek() => Container(
        padding: const EdgeInsets.all(NiaTokens.s4),
        decoration: BoxDecoration(color: NiaTokens.homeInk, borderRadius: BorderRadius.circular(20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                const Expanded(
                  child: Text('Added to your NiaBook this week', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: NiaTokens.homeGround)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: NiaTokens.homePositive, borderRadius: BorderRadius.circular(999)),
                  child: Text('+${formatPaise(5100)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NiaTokens.homeOnPrimary)),
                ),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            const WarmWhyNow("Stock up before payday on the 1st to keep this month's surplus higher.", onDark: true),
          ],
        ),
      );

  Widget _grid(BuildContext context) => Column(
        children: <Widget>[
          for (int i = 0; i < _items.length; i += 2) ...<Widget>[
            if (i > 0) const SizedBox(height: NiaTokens.s3),
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Expanded(child: _productCard(context, _items[i])),
                  const SizedBox(width: NiaTokens.s3),
                  Expanded(child: i + 1 < _items.length ? _productCard(context, _items[i + 1]) : const SizedBox()),
                ],
              ),
            ),
          ],
        ],
      );

  Widget _productCard(BuildContext context, _Item item) => WarmCard(
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Stack(
              children: <Widget>[
                Container(
                  height: 88,
                  decoration: const BoxDecoration(color: NiaTokens.homeSecondary),
                  child: Center(child: Icon(item.icon, size: 34, color: NiaTokens.homeMuted)),
                ),
                if (item.certified)
                  Positioned(
                    left: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(color: NiaTokens.homeCard, borderRadius: BorderRadius.circular(999)),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Icon(Icons.verified, size: 11, color: NiaTokens.homePrimary),
                          SizedBox(width: 3),
                          Text('Nia-Certified', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: NiaTokens.homePrimary)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(NiaTokens.s3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.25, color: NiaTokens.homeInk)),
                  Text(item.unit, style: const TextStyle(fontSize: 11, color: NiaTokens.homeMuted)),
                  const SizedBox(height: NiaTokens.s2),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: <Widget>[
                                Text(formatPaise(item.price * 100), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
                                const SizedBox(width: 4),
                                Text(formatPaise(item.market * 100),
                                    style: const TextStyle(fontSize: 11, color: NiaTokens.homeMuted, decoration: TextDecoration.lineThrough)),
                              ],
                            ),
                            Text('+${formatPaise((item.market - item.price) * 100)} to your NiaBook',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: NiaTokens.homePositive)),
                            Text('${item.savedPct}% under market', style: const TextStyle(fontSize: 10, color: NiaTokens.homeMuted)),
                          ],
                        ),
                      ),
                      const SizedBox(width: NiaTokens.s2),
                      Material(
                        color: NiaTokens.homePrimary,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: () => prototypeNoOp(context, 'Add ${item.name}'),
                          child: const Padding(padding: EdgeInsets.all(7), child: Icon(Icons.add, size: 16, color: NiaTokens.homeOnPrimary)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
