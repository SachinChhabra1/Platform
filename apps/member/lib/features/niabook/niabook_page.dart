import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../pillars/nia_components.dart';
import '../pillars/pillar_kit.dart';
import 'niabook_scenario.dart';

/// NiaBook — the first screen and the artefact of progress. Two columns:
///   • Left — **What became true**: money the Member gained this month, closed.
///     NiaBook proves it.
///   • Right — **More you can keep**: opportunities still waiting, found by
///     RafiQi. Every month moves a line from right to left.
///
/// Money first, explanation second; no judgement; restrained blue accent over
/// soft greys (approved two-column design). The Member reaches help in one tap
/// via the SOS action (Nia Emergency, Book IV §3.6).
///
/// Optimise for scanning, not symmetry: the Member should understand the page in
/// under five seconds, so hierarchy beats visual balance. The two-column model is
/// frozen, but the pixels are negotiable — column widths flex for readability.
class NiaBookPage extends StatelessWidget {
  const NiaBookPage({super.key, this.month = NiaBookMonth.sample});

  final NiaBookMonth month;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s7),
      children: <Widget>[
        _titleRow(context),
        const SizedBox(height: NiaTokens.s4),
        _identityRow(context),
        const SizedBox(height: NiaTokens.s4),
        _monthDropdown(context),
        const SizedBox(height: NiaTokens.s5),
        _summaryLine(context),
        const SizedBox(height: NiaTokens.s3),
        _statusLine(),
        const SizedBox(height: NiaTokens.s4),
        const Divider(height: 1, thickness: 1, color: NiaTokens.hairline),
        const SizedBox(height: NiaTokens.s4),
        // Optimise for scanning, not symmetry. The right column carries longer
        // titles and the opportunity chain, so it takes more width (45/55).
        // Hierarchy beats visual balance.
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Expanded(flex: 45, child: _leftColumn(context)),
              const VerticalDivider(
                  width: NiaTokens.s5, thickness: 1, color: NiaTokens.hairline),
              Expanded(flex: 55, child: _rightColumn(context)),
            ],
          ),
        ),
        const SizedBox(height: NiaTokens.s5),
        const Divider(height: 1, thickness: 1, color: NiaTokens.hairline),
        const SizedBox(height: NiaTokens.s4),
        // Continuity Coaching (Q9): one calm next step. Progress, not engagement.
        const CoachingLine(
          fact: '₹300 more stayed with you this month.',
          next: 'your ₹500 Sukh voucher is ready to use.',
        ),
      ],
    );
  }

  // ── Top area ───────────────────────────────────────────────────────────
  Widget _titleRow(BuildContext context) => Row(
        children: <Widget>[
          const Text('NiaBook',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: NiaTokens.blue)),
          const Spacer(),
          InkWell(
            onTap: () => prototypeNoOp(context, 'Language'),
            child: Row(
              children: const <Widget>[
                Icon(Icons.language, size: 18, color: NiaTokens.inkSecondary),
                SizedBox(width: NiaTokens.s1),
                Text('English',
                    style: TextStyle(fontSize: 14, color: NiaTokens.ink)),
                Icon(Icons.keyboard_arrow_down,
                    size: 18, color: NiaTokens.inkSecondary),
              ],
            ),
          ),
        ],
      );

  Widget _identityRow(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Monogram(initials: month.memberName.substring(0, 1), size: 44),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('Hi, ${month.memberName}',
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: NiaTokens.ink)),
                const SizedBox(height: 2),
                Row(
                  children: <Widget>[
                    const Icon(Icons.place_outlined,
                        size: 14, color: NiaTokens.inkSecondary),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(month.studio,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontSize: 13, color: NiaTokens.inkSecondary)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: NiaTokens.s2),
          // Shared SOS control (E4): one implementation for every screen. Opens Nia
          // Emergency — an abstract route (today the Operator), never red.
          niaSosButton(context),
        ],
      );

  Widget _monthDropdown(BuildContext context) => InkWell(
        onTap: () => prototypeNoOp(context, 'Choose month'),
        borderRadius: BorderRadius.circular(NiaTokens.radius),
        child: Container(
          padding: const EdgeInsets.symmetric(
              horizontal: NiaTokens.s4, vertical: NiaTokens.s3),
          decoration: BoxDecoration(
            border: Border.all(color: NiaTokens.hairline),
            borderRadius: BorderRadius.circular(NiaTokens.radius),
          ),
          child: Row(
            children: <Widget>[
              Text(month.monthLabel,
                  style: const TextStyle(fontSize: 16, color: NiaTokens.ink)),
              const Spacer(),
              const Icon(Icons.keyboard_arrow_down,
                  size: 22, color: NiaTokens.inkSecondary),
            ],
          ),
        ),
      );

  Widget _summaryLine(BuildContext context) => Text.rich(
        TextSpan(
          style: const TextStyle(fontSize: 18, height: 1.3, color: NiaTokens.ink),
          children: <InlineSpan>[
            TextSpan(
                text: formatPaise(month.summaryDeltaPaise),
                style: const TextStyle(
                    color: NiaTokens.blue, fontWeight: FontWeight.w700)),
            const TextSpan(
                text: ' more stayed with you than in May.',
                style: TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      );

  Widget _statusLine() => Row(
        children: <Widget>[
          // The signature ○→✓ motion: the "unlocked" tally opens as waiting and
          // completes to true on load — the movement made visible.
          const MovementCheck(size: 16),
          const SizedBox(width: NiaTokens.s1),
          Text('${month.unlockedCount} unlocked',
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: NiaTokens.ink)),
          const SizedBox(width: NiaTokens.s3),
          const Icon(Icons.radio_button_unchecked,
              size: 16, color: NiaTokens.inkSecondary),
          const SizedBox(width: NiaTokens.s1),
          Text('${month.waitingCount} waiting',
              style: const TextStyle(
                  fontSize: 14, color: NiaTokens.inkSecondary)),
        ],
      );

  // ── Left column — what became true ───────────────────────────────────────
  Widget _leftColumn(BuildContext context) => Padding(
        padding: const EdgeInsets.only(right: NiaTokens.s2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _columnHeading('WHAT BECAME TRUE', 'Your progress.'),
            const SizedBox(height: NiaTokens.s4),
            // Each line that became true this month plays the ○→✓ motion, staggered
            // down the column so the left side visibly fills in on open.
            for (final MapEntry<int, BecameTrueRow> e
                in month.becameTrue.asMap().entries) ...<Widget>[
              _becameTrueRow(e.value,
                  Duration(milliseconds: 420 + e.key * 140)),
              const SizedBox(height: NiaTokens.s4),
            ],
            _progressCard(),
            const SizedBox(height: NiaTokens.s4),
            _sukhCard(context),
          ],
        ),
      );

  Widget _becameTrueRow(BecameTrueRow r, Duration checkMotion) => Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          _iconChip(r.icon, check: true, checkMotion: checkMotion),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(formatPaise(r.amountPaise),
                      style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.ink)),
                ),
                Text(r.label,
                    style: const TextStyle(
                        fontSize: 13, color: NiaTokens.inkSecondary)),
              ],
            ),
          ),
        ],
      );

  Widget _progressCard() => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(NiaTokens.s4),
        decoration: BoxDecoration(
          color: NiaTokens.surfaceGrey,
          borderRadius: BorderRadius.circular(NiaTokens.radius),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(month.progressHeadline,
                style: const TextStyle(
                    fontSize: 16,
                    height: 1.25,
                    fontWeight: FontWeight.w700,
                    color: NiaTokens.ink)),
            const SizedBox(height: NiaTokens.s2),
            Text(month.progressSub,
                style: const TextStyle(
                    fontSize: 13, color: NiaTokens.inkSecondary)),
          ],
        ),
      );

  Widget _sukhCard(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(NiaTokens.s4),
        decoration: BoxDecoration(
          border: Border.all(color: NiaTokens.hairline),
          borderRadius: BorderRadius.circular(NiaTokens.radius),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: const <Widget>[
                Icon(Icons.local_offer_outlined, size: 14, color: NiaTokens.blue),
                SizedBox(width: NiaTokens.s1),
                Expanded(
                  child: Text('THIS WEEK AT SUKH',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                          color: NiaTokens.blue)),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(month.sukhSubcopy,
                style:
                    const TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
            const SizedBox(height: NiaTokens.s3),
            for (final SukhOffer o in month.sukhOffers) ...<Widget>[
              _sukhOfferRow(o),
              const SizedBox(height: NiaTokens.s2),
            ],
            const SizedBox(height: NiaTokens.s1),
            _link(context, 'See all offers', 'See all offers'),
          ],
        ),
      );

  // One flowing line per offer so the item name never breaks mid-word in the
  // narrow column: "Atta · 5kg  ₹180 → ₹170" (was struck, now bold).
  Widget _sukhOfferRow(SukhOffer o) => Text.rich(
        TextSpan(
          style:
              const TextStyle(fontSize: 13, height: 1.4, color: NiaTokens.ink),
          children: <InlineSpan>[
            TextSpan(text: '${o.name}  '),
            TextSpan(
                text: formatPaise(o.wasPaise),
                style: const TextStyle(
                    fontSize: 12,
                    color: NiaTokens.inkSecondary,
                    decoration: TextDecoration.lineThrough)),
            const TextSpan(
                text: ' → ', style: TextStyle(color: NiaTokens.inkSecondary)),
            TextSpan(
                text: formatPaise(o.nowPaise),
                style: const TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
      );

  // ── Right column — more you can keep ────────────────────────────────────
  Widget _rightColumn(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: NiaTokens.s2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _columnHeadingRafiqi(),
            const SizedBox(height: NiaTokens.s4),
            for (final Opportunity o in month.opportunities) ...<Widget>[
              _opportunityCard(o),
              const SizedBox(height: NiaTokens.s3),
            ],
            const SizedBox(height: NiaTokens.s1),
            _link(
                context,
                'See all opportunities (${month.totalOpportunities})',
                'See all opportunities'),
          ],
        ),
      );

  Widget _opportunityCard(Opportunity o) {
    final bool locked = o.status == OppStatus.locked;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(NiaTokens.s4),
      decoration: BoxDecoration(
        color: o.hero ? NiaTokens.ground : NiaTokens.surfaceGrey,
        border: o.hero ? Border.all(color: NiaTokens.blue, width: 2) : null,
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              _iconChip(
                o.hero
                    ? Icons.work_outline
                    : (o.status == OppStatus.ready
                        ? Icons.card_giftcard
                        : Icons.groups_outlined),
                filled: o.hero,
                muted: locked,
              ),
              const SizedBox(width: NiaTokens.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    if (o.badge != null)
                      Text(o.badge!,
                          style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                              color: NiaTokens.blue)),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(o.gain,
                          style: TextStyle(
                              fontSize: o.hero ? 24 : 20,
                              fontWeight: FontWeight.w700,
                              color: locked
                                  ? NiaTokens.inkSecondary
                                  : NiaTokens.blue)),
                    ),
                    Text(o.title,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: NiaTokens.ink)),
                  ],
                ),
              ),
            ],
          ),
          if (o.detail != null) ...<Widget>[
            const SizedBox(height: NiaTokens.s2),
            Text(o.detail!,
                style: const TextStyle(
                    fontSize: 13, height: 1.3, color: NiaTokens.inkSecondary)),
          ],
          if (o.chain != null) ...<Widget>[
            const SizedBox(height: NiaTokens.s3),
            const Divider(height: 1, thickness: 1, color: NiaTokens.hairline),
            const SizedBox(height: NiaTokens.s3),
            ..._chain(o.chain!),
          ],
          const SizedBox(height: NiaTokens.s3),
          const Divider(height: 1, thickness: 1, color: NiaTokens.hairline),
          const SizedBox(height: NiaTokens.s2),
          _opportunityStatus(o),
        ],
      ),
    );
  }

  // The hero's chain: a step, a down-arrow, the next step. Fixed leading icons.
  List<Widget> _chain(List<String> steps) {
    const List<IconData> icons = <IconData>[
      Icons.school_outlined,
      Icons.savings_outlined,
      Icons.home_outlined,
    ];
    final List<Widget> out = <Widget>[];
    for (int i = 0; i < steps.length; i++) {
      out.add(Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(i < icons.length ? icons[i] : Icons.circle_outlined,
              size: 16, color: NiaTokens.blue),
          const SizedBox(width: NiaTokens.s2),
          Expanded(
            child: Text(steps[i],
                style: const TextStyle(
                    fontSize: 13, height: 1.3, color: NiaTokens.ink)),
          ),
        ],
      ));
      if (i < steps.length - 1) {
        out.add(const Padding(
          padding: EdgeInsets.symmetric(vertical: 1),
          child: Icon(Icons.keyboard_arrow_down,
              size: 16, color: NiaTokens.inkSecondary),
        ));
      }
    }
    return out;
  }

  Widget _opportunityStatus(Opportunity o) {
    late final IconData icon;
    late final Color color;
    switch (o.status) {
      case OppStatus.inProgress:
        icon = Icons.hourglass_empty;
        color = NiaTokens.blue;
        break;
      case OppStatus.ready:
        icon = Icons.circle;
        color = NiaTokens.blue;
        break;
      case OppStatus.locked:
        icon = Icons.lock_outline;
        color = NiaTokens.inkSecondary;
        break;
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Icon(icon, size: 14, color: color),
        const SizedBox(width: NiaTokens.s1),
        Expanded(
          child: Text(o.statusText,
              style: TextStyle(
                  fontSize: 12,
                  height: 1.3,
                  fontWeight: o.status == OppStatus.ready
                      ? FontWeight.w600
                      : FontWeight.w400,
                  color: color)),
        ),
      ],
    );
  }

  // ── Shared pieces ────────────────────────────────────────────────────────
  Widget _columnHeading(String heading, String sub) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(heading,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: NiaTokens.blue)),
          const SizedBox(height: 2),
          Text(sub,
              style:
                  const TextStyle(fontSize: 13, color: NiaTokens.inkSecondary)),
        ],
      );

  // Right heading names RafiQi as the finder, not the hero (quiet, inline).
  Widget _columnHeadingRafiqi() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text('MORE YOU CAN KEEP',
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: NiaTokens.blue)),
          const SizedBox(height: 2),
          Text.rich(TextSpan(
            style:
                const TextStyle(fontSize: 13, color: NiaTokens.inkSecondary),
            children: const <InlineSpan>[
              TextSpan(text: 'Found by '),
              TextSpan(
                  text: 'RafiQi',
                  style: TextStyle(
                      fontWeight: FontWeight.w600, color: NiaTokens.blue)),
            ],
          )),
        ],
      );

  Widget _iconChip(IconData icon,
      {bool check = false,
      bool filled = false,
      bool muted = false,
      Duration? checkMotion}) {
    final Color bg = filled
        ? NiaTokens.blue
        : (muted ? NiaTokens.surfaceGrey : NiaTokens.surfaceGrey);
    final Color fg = filled
        ? NiaTokens.ground
        : (muted ? NiaTokens.inkSecondary : NiaTokens.blue);
    return SizedBox(
      width: 40,
      height: 40,
      child: Stack(
        clipBehavior: Clip.none,
        children: <Widget>[
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: fg),
          ),
          if (check)
            Positioned(
              right: -3,
              bottom: -3,
              child: Container(
                decoration: const BoxDecoration(
                    color: NiaTokens.ground, shape: BoxShape.circle),
                child: checkMotion != null
                    ? MovementCheck(size: 16, duration: checkMotion)
                    : const Icon(Icons.check_circle,
                        size: 16, color: NiaTokens.blue),
              ),
            ),
          if (muted)
            const Positioned(
              right: -3,
              bottom: -3,
              child: Icon(Icons.lock, size: 14, color: NiaTokens.inkSecondary),
            ),
        ],
      ),
    );
  }

  Widget _link(BuildContext context, String label, String action) => InkWell(
        onTap: () => prototypeNoOp(context, action),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: NiaTokens.s1),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Flexible(
                child: Text(label,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: NiaTokens.blue)),
              ),
              const Icon(Icons.chevron_right, size: 16, color: NiaTokens.blue),
            ],
          ),
        ),
      );
}
