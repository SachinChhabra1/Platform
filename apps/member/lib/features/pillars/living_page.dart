/// Living · Keep more — how to keep more next month by living well for less. Warm
/// NiaBook design (v0 prototype, migrated 2026-07-05): the current Nest (reality),
/// the Living membership due (reality), food plan, amenities, maintenance and
/// notices (supporting). Opens on the NiaBook strip so the pillar points home —
/// living membership on time + a shared Nest become what the Member kept.
///
/// Vocabulary is canonical (Book VIII): Nest (never room/bed), Studio, Living
/// membership (never rent). No Living backend contract yet, so sample-only (no
/// live ApiSource / async states).
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../niabook/niabook_scenario.dart' show formatPaise;
import 'warm_pillar_kit.dart';

class LivingPage extends StatelessWidget {
  const LivingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return WarmScreen(
      title: 'Living',
      subtitle: 'Keep more, grow your NiaBook',
      children: <Widget>[
        const NiaBookStrip(note: 'Living membership on time and a shared Nest kept +₹400 in your pocket.'),
        _nest(),
        _membership(context),
        _foodPlan(context),
        _amenities(),
        _maintenance(context),
        _notices(),
      ],
    );
  }

  // ── Current Nest ─────────────────────────────────────────────────────────
  Widget _nest() => WarmCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
                  child: const Icon(Icons.cottage_outlined, size: 22, color: NiaTokens.homePrimary),
                ),
                const SizedBox(width: NiaTokens.s3),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text('Nia Nest · Whitefield', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
                      Text('Studio 4B · Nest 2', style: TextStyle(fontSize: 13, color: NiaTokens.homeMuted)),
                    ],
                  ),
                ),
                const WarmStatusPill('Active', tone: WarmTone.positive, icon: Icons.check_circle_outline),
              ],
            ),
            const SizedBox(height: NiaTokens.s4),
            Container(
              padding: const EdgeInsets.all(NiaTokens.s3),
              decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
              child: Row(
                children: <Widget>[
                  const Icon(Icons.group_outlined, size: 16, color: NiaTokens.homeMuted),
                  const SizedBox(width: NiaTokens.s2),
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted),
                        children: const <TextSpan>[
                          TextSpan(text: 'Sharing your Nest: '),
                          TextSpan(text: 'Bikash, Suresh, Ramesh', style: TextStyle(fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );

  // ── Living membership due ──────────────────────────────────────────────────
  Widget _membership(BuildContext context) => Container(
        padding: const EdgeInsets.all(NiaTokens.s4),
        decoration: BoxDecoration(
          color: NiaTokens.homeCautionSoft,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: NiaTokens.homeCaution.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text('July Living membership', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeCaution)),
                      const SizedBox(height: 2),
                      Text(formatPaise(450000), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: NiaTokens.homeCaution)),
                      const Text('Due in 3 days · 7 Jul', style: TextStyle(fontSize: 12, color: NiaTokens.homeCaution)),
                    ],
                  ),
                ),
                Material(
                  color: NiaTokens.homePrimary,
                  borderRadius: BorderRadius.circular(999),
                  child: InkWell(
                    customBorder: const StadiumBorder(),
                    onTap: () => prototypeNoOp(context, 'Pay Living membership'),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: NiaTokens.s5, vertical: 10),
                      child: Text('Pay now', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeOnPrimary)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            const Text("Or let Nia auto-pay from your protected wage so it's never late.",
                style: TextStyle(fontSize: 12, height: 1.4, color: NiaTokens.homeCaution)),
          ],
        ),
      );

  // ── Food plan ──────────────────────────────────────────────────────────────
  Widget _foodPlan(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          WarmSectionTitle('Food plan', action: 'Manage'),
          WarmCard(
            child: Column(
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(color: NiaTokens.homePositiveSoft, borderRadius: BorderRadius.circular(NiaTokens.radius)),
                      child: const Icon(Icons.restaurant, size: 20, color: NiaTokens.homePositive),
                    ),
                    const SizedBox(width: NiaTokens.s3),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text('Daily Curry Plan', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                          Text('Dinner · veg + non-veg', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                        ],
                      ),
                    ),
                    const WarmStatusPill('Active', tone: WarmTone.positive),
                  ],
                ),
                const SizedBox(height: NiaTokens.s3),
                Container(
                  padding: const EdgeInsets.all(NiaTokens.s3),
                  decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
                  child: const Row(
                    children: <Widget>[
                      Text('Next meal', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                      Spacer(),
                      Text('Tonight · Chicken curry, rice', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      );

  // ── Amenities ────────────────────────────────────────────────────────────
  Widget _amenities() {
    const items = <(IconData, String)>[
      (Icons.wifi, 'Wi-Fi'),
      (Icons.hot_tub_outlined, 'Water heater'),
      (Icons.local_laundry_service_outlined, 'Laundry'),
      (Icons.fitness_center, 'Gym'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const WarmSectionTitle('Amenities'),
        Row(
          children: <Widget>[
            for (int i = 0; i < items.length; i++) ...<Widget>[
              if (i > 0) const SizedBox(width: NiaTokens.s2),
              Expanded(
                child: WarmCard(
                  padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3, horizontal: NiaTokens.s2),
                  child: Column(
                    children: <Widget>[
                      Icon(items[i].$1, size: 20, color: NiaTokens.homePrimary),
                      const SizedBox(height: NiaTokens.s2),
                      Text(items[i].$2, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: NiaTokens.homeInk)),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  // ── Maintenance ─────────────────────────────────────────────────────────
  Widget _maintenance(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          WarmSectionTitle('Maintenance', action: 'New request'),
          WarmCard(
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: const <Widget>[
                WarmListRow(
                  icon: Icons.build_outlined,
                  title: 'Water heater not heating',
                  subtitle: 'Raised 1 Jul',
                  trailing: WarmStatusPill('In progress', tone: WarmTone.info),
                ),
                WarmDivider(),
                WarmListRow(
                  icon: Icons.build_outlined,
                  title: 'Kitchen tap leak',
                  subtitle: 'Closed 22 Jun',
                  trailing: WarmStatusPill('Resolved', tone: WarmTone.positive),
                ),
              ],
            ),
          ),
        ],
      );

  // ── Notices ────────────────────────────────────────────────────────────
  Widget _notices() => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const <Widget>[
          WarmSectionTitle('Notices'),
          WarmCard(
            padding: EdgeInsets.symmetric(horizontal: NiaTokens.s4),
            child: Column(
              children: <Widget>[
                WarmListRow(icon: Icons.campaign_outlined, title: 'Water tank cleaning', subtitle: 'Sat 5 Jul, 9am–12pm'),
                WarmDivider(),
                WarmListRow(icon: Icons.campaign_outlined, title: 'New curry menu this week', subtitle: 'Updated 1 Jul'),
              ],
            ),
          ),
        ],
      );
}
