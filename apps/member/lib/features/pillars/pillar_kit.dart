import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// Shared building blocks for the four pillar screens (Work · Living · Store ·
/// Family). They inherit NiaBook's design language exactly — restrained blue over
/// soft greys, thin icons, cards, money first — so the pillars and the ledger
/// read as one product. Every pillar closes with a "this improves your NiaBook"
/// strip: the flywheel law made visible.

/// The semantic role of a body block. Every pillar answers the same questions in
/// the same language; only the content changes. No pillar may add an untyped
/// block — that is how structure stays consistent across the product.
enum PillarSection {
  /// Today's reality — the current job, the studio and its cost, savings so far,
  /// what has reached home.
  reality,

  /// The immediate opportunity — a better job, a cheaper path, a voucher, a way
  /// to meet an upcoming goal. Found by RafiQi; decided by the Member.
  opportunity,

  /// Supporting detail — certifications, community and services, essentials,
  /// benefits and protection.
  supporting,
}

/// One typed block in a pillar body.
class PillarBlock {
  const PillarBlock(this.role, this.child);
  final PillarSection role;
  final Widget child;
}

/// The canonical interaction model for every pillar. This is not just a shared
/// widget — it is the product's structure. Each pillar screen contains the same
/// semantic scaffold:
///
///   Identity  →  Economic promise  →  [reality · opportunity · supporting]
///   →  How this improves NiaBook
///
/// The labels change; the scaffold never does. Identity (the header), the promise
/// (the headline), and the contribution (the closing NiaBook strip) are fixed
/// anchors; the body is composed of typed [PillarBlock]s in the order the
/// approved screen specifies. A pillar must include all three body roles — the
/// assert enforces the contract, so no pillar can quietly drop a section or
/// invent its own.
class PillarScaffold extends StatelessWidget {
  PillarScaffold({
    super.key,
    required this.pillar,
    required this.promise,
    required this.promiseSub,
    required this.body,
    required this.contribution,
  }) : assert(
          body.map((PillarBlock b) => b.role).toSet().length == 3,
          'A pillar must contain all three body roles: reality, opportunity, '
          'and supporting. Consistency is part of the product.',
        );

  /// Identity — the pillar name in the header (e.g. "Work").
  final String pillar;

  /// The economic promise — the headline (e.g. "Earn more") and its subcopy.
  final String promise;
  final String promiseSub;

  /// The typed body, in the approved screen's order.
  final List<PillarBlock> body;

  /// How this improves NiaBook — the flywheel contribution, always last.
  final Widget contribution;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: pillarPadding,
      children: <Widget>[
        pillarHeader(context, pillar),
        const SizedBox(height: NiaTokens.s4),
        pillarHeadline(promise, promiseSub),
        const SizedBox(height: NiaTokens.s5),
        for (final PillarBlock b in body) ...<Widget>[
          b.child,
          const SizedBox(height: NiaTokens.s4),
        ],
        contribution,
      ],
    );
  }
}

/// Page header: the pillar name on the left, SOS on the right. SOS opens Nia
/// Emergency (abstract routing; today the Operator), never red.
Widget pillarHeader(BuildContext context, String title) => Row(
      children: <Widget>[
        Text(title,
            style: const TextStyle(
                fontSize: 16, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        const Spacer(),
        niaSosButton(context),
      ],
    );

Widget niaSosButton(BuildContext context) => InkWell(
      onTap: () => openNiaEmergency(context),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: NiaTokens.s3, vertical: NiaTokens.s2),
        decoration: BoxDecoration(
          border: Border.all(color: NiaTokens.blue),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const <Widget>[
            Icon(Icons.shield_outlined, size: 16, color: NiaTokens.blue),
            SizedBox(width: 4),
            Text('SOS',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: NiaTokens.blue)),
          ],
        ),
      ),
    );

/// The big headline + quiet subcopy under the header.
Widget pillarHeadline(String headline, String sub) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(headline,
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w700, color: NiaTokens.ink)),
        const SizedBox(height: 2),
        Text(sub,
            style: const TextStyle(fontSize: 14, color: NiaTokens.inkSecondary)),
      ],
    );

/// A small-caps label, blue by default (grey when muted).
Widget capsLabel(String s, {Color color = NiaTokens.blue}) => Text(
      s,
      style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: color),
    );

/// A plain section title (sentence case, ink) — e.g. "Better jobs waiting".
Widget sectionTitle(String s, {Widget? trailing}) => Row(
      children: <Widget>[
        Text(s,
            style: const TextStyle(
                fontSize: 15, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        if (trailing != null) ...<Widget>[const Spacer(), trailing],
      ],
    );

/// A rounded icon chip. Grey by default; [filled] paints solid blue with a white
/// icon (the hero chip); [muted] greys the icon; [check] adds a small blue check
/// badge (a gain that became true).
Widget niaIconChip(IconData icon,
    {bool filled = false, bool muted = false, bool check = false, double size = 40}) {
  final Color bg = filled ? NiaTokens.blue : NiaTokens.surfaceGrey;
  final Color fg =
      filled ? NiaTokens.ground : (muted ? NiaTokens.inkSecondary : NiaTokens.blue);
  return SizedBox(
    width: size,
    height: size,
    child: Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          decoration: BoxDecoration(
              color: bg, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, size: size * 0.5, color: fg),
        ),
        if (check)
          const Positioned(
            right: -3,
            bottom: -3,
            child: DecoratedBox(
              decoration:
                  BoxDecoration(color: NiaTokens.ground, shape: BoxShape.circle),
              child: Icon(Icons.check_circle, size: 16, color: NiaTokens.blue),
            ),
          ),
      ],
    ),
  );
}

/// A card container: white with a hairline by default; [grey] fills soft grey;
/// [hero] paints a 2px blue border (the primary opportunity).
Widget niaCard({required Widget child, bool hero = false, bool grey = false}) =>
    Container(
      width: double.infinity,
      padding: const EdgeInsets.all(NiaTokens.s4),
      decoration: BoxDecoration(
        color: grey ? NiaTokens.surfaceGrey : NiaTokens.ground,
        border: hero
            ? Border.all(color: NiaTokens.blue, width: 2)
            : (grey ? null : Border.all(color: NiaTokens.hairline)),
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: child,
    );

/// A list row: icon + title + subtitle, with an optional trailing string (e.g. a
/// gain) and a chevron.
Widget niaListRow(
  IconData icon,
  String title,
  String subtitle, {
  String? trailing,
  Color trailingColor = NiaTokens.blue,
  bool chevron = false,
}) =>
    Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Icon(icon, size: 18, color: NiaTokens.blue),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: NiaTokens.ink)),
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: NiaTokens.inkSecondary)),
              ],
            ),
          ),
          if (trailing != null)
            Text(trailing,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: trailingColor)),
          if (chevron)
            const Padding(
              padding: EdgeInsets.only(left: 4),
              child: Icon(Icons.chevron_right, size: 18, color: NiaTokens.inkSecondary),
            ),
        ],
      ),
    );

/// A stat cell (label, value, sub) — used in pairs.
Widget statCard(String label, String value, String sub) => Container(
      padding: const EdgeInsets.all(NiaTokens.s3),
      decoration: BoxDecoration(
        color: NiaTokens.surfaceGrey,
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          capsLabel(label, color: NiaTokens.inkSecondary),
          const SizedBox(height: NiaTokens.s1),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(value,
                style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: NiaTokens.ink)),
          ),
          const SizedBox(height: 2),
          Text(sub,
              style:
                  const TextStyle(fontSize: 12, color: NiaTokens.inkSecondary)),
        ],
      ),
    );

/// An icon tile (icon over label over status) — the 4-across grids.
Widget iconTile(IconData icon, String label, String status) => Column(
      children: <Widget>[
        Icon(icon, size: 20, color: NiaTokens.blue),
        const SizedBox(height: NiaTokens.s1),
        Text(label,
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        Text(status,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: NiaTokens.inkSecondary)),
      ],
    );

/// A small pill tag (e.g. "Work", "Store") used on cross-pillar RafiQi lines.
Widget pillarTag(String s) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: NiaTokens.blueTint,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(s,
          style: const TextStyle(
              fontSize: 11, fontWeight: FontWeight.w600, color: NiaTokens.blue)),
    );

/// The flywheel strip that closes every pillar: "this improves your NiaBook".
Widget niaBookStrip(String title, String sub) => Container(
      width: double.infinity,
      padding: const EdgeInsets.all(NiaTokens.s3),
      decoration: BoxDecoration(
        color: NiaTokens.blueTint,
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Icon(Icons.trending_up, size: 18, color: NiaTokens.blue),
          const SizedBox(width: NiaTokens.s2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: NiaTokens.blue)),
                Text(sub,
                    style: const TextStyle(
                        fontSize: 12, color: NiaTokens.inkSecondary)),
              ],
            ),
          ),
        ],
      ),
    );

/// A quiet blue text link with a chevron (no behaviour in the prototype).
Widget niaLink(BuildContext context, String label, {String? action}) => InkWell(
      onTap: () => prototypeNoOp(context, action ?? label),
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
    );

/// A hairline divider used between list rows.
Widget niaHairline() => const Divider(
    height: 1, thickness: 1, color: NiaTokens.hairline);

/// A "<label> · found by RafiQi" line (RafiQi in blue). RafiQi is the finder of
/// opportunity across every pillar — named, never the hero.
Widget foundByRafiqi(String label) => Text.rich(
      TextSpan(
        style: const TextStyle(fontSize: 12, color: NiaTokens.inkSecondary),
        children: <InlineSpan>[
          TextSpan(text: '$label · found by '),
          const TextSpan(
              text: 'RafiQi',
              style:
                  TextStyle(fontWeight: FontWeight.w600, color: NiaTokens.blue)),
        ],
      ),
    );

/// Standard scroll padding for a pillar page body.
const EdgeInsets pillarPadding = EdgeInsets.fromLTRB(
    NiaTokens.s5, NiaTokens.s5, NiaTokens.s5, NiaTokens.s7);
