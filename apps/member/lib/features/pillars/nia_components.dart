import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import 'pillar_kit.dart';

/// Production component set for the Nia OS screens — reused across NiaBook and the
/// four pillars. Built on the design language in `pillar_kit.dart`; named and
/// widget-based so screens compose them rather than hand-rolling layout.
///   InfoCard · OpportunityCard · SummaryCard · SectionHeader · ListRow
/// Plus NiaReveal, the restrained entrance motion.

/// The card surface: white + hairline (plain), soft grey (grey), or a 2px blue
/// border for the primary item (hero).
enum CardStyle { plain, grey, hero }

class InfoCard extends StatelessWidget {
  const InfoCard({super.key, required this.child, this.style = CardStyle.plain, this.padding});

  final Widget child;
  final CardStyle style;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding ?? const EdgeInsets.all(NiaTokens.s4),
      decoration: BoxDecoration(
        color: style == CardStyle.grey ? NiaTokens.surfaceGrey : NiaTokens.ground,
        border: style == CardStyle.hero
            ? Border.all(color: NiaTokens.blue, width: 2)
            : (style == CardStyle.grey
                ? null
                : Border.all(color: NiaTokens.hairline)),
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: child,
    );
  }
}

/// A section header: a title with an optional trailing action (e.g. "See all").
class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.trailing});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Text(title,
            style: const TextStyle(
                fontSize: 15, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        if (trailing != null) ...<Widget>[const Spacer(), trailing!],
      ],
    );
  }
}

/// A tappable list row: icon + title + subtitle, optional trailing string, and a
/// chevron. Accessible (a single button node with a merged label) and a 48pt hit
/// target.
class ListRow extends StatelessWidget {
  const ListRow({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.trailingColor = NiaTokens.inkSecondary,
    this.showChevron = false,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String? trailing;
  final Color trailingColor;
  final bool showChevron;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: onTap != null,
      label: subtitle.isEmpty ? title : '$title. $subtitle',
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 48),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
            child: Row(
              children: <Widget>[
                Icon(icon, size: 18, color: NiaTokens.blue),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(title,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: NiaTokens.ink)),
                      if (subtitle.isNotEmpty)
                        Text(subtitle,
                            style: const TextStyle(
                                fontSize: 12, color: NiaTokens.inkSecondary)),
                    ],
                  ),
                ),
                if (trailing != null)
                  Text(trailing!,
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: trailingColor)),
                if (showChevron)
                  const Padding(
                    padding: EdgeInsets.only(left: 4),
                    child: Icon(Icons.chevron_right,
                        size: 18, color: NiaTokens.inkSecondary),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// An opportunity found by RafiQi: a titled row with a gain and a cross-pillar
/// tag, under a "<label> · found by RafiQi" line. The reusable pattern for the
/// "more you can keep" moment on every pillar.
class OpportunityCard extends StatelessWidget {
  const OpportunityCard({
    super.key,
    required this.foundLabel,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gain,
    required this.tag,
  });

  final String foundLabel;
  final IconData icon;
  final String title;
  final String subtitle;
  final String gain;
  final String tag;

  @override
  Widget build(BuildContext context) {
    return InfoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          foundByRafiqi(foundLabel),
          const SizedBox(height: NiaTokens.s2),
          Row(
            children: <Widget>[
              niaIconChip(icon),
              const SizedBox(width: NiaTokens.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(title,
                        style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: NiaTokens.ink)),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 12, color: NiaTokens.inkSecondary)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Text(gain,
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: NiaTokens.blue)),
                  const SizedBox(height: 2),
                  pillarTag(tag),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The flywheel summary that closes a pillar: a blue-tint card, "trending up",
/// a bold blue headline and a quiet subline — how this feeds NiaBook.
class SummaryCard extends StatelessWidget {
  const SummaryCard({
    super.key,
    required this.title,
    required this.subtitle,
    this.icon = Icons.trending_up,
  });

  final String title;
  final String subtitle;

  /// The leading glyph. Defaults to `trending_up` (the flywheel). Family closes
  /// on care, not finance, so it passes a heart — the one pillar whose flywheel
  /// closes emotionally.
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(NiaTokens.s3),
      decoration: BoxDecoration(
        color: NiaTokens.blueTint,
        borderRadius: BorderRadius.circular(NiaTokens.radius),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon, size: 18, color: NiaTokens.blue),
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
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: NiaTokens.inkSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Restrained entrance motion — a subtle fade and 8px rise on mount, easeOutCubic.
/// One-shot (settles under pumpAndSettle, so goldens capture the final frame).
/// Honors the OS "Reduce Motion" flag: when set, it snaps to the final frame
/// (Duration.zero) instead of playing. Golden-neutral — under test the flag is
/// off, so the settled frame is unchanged (R9 Motion audit).
class NiaReveal extends StatelessWidget {
  const NiaReveal({super.key, required this.child, this.duration = const Duration(milliseconds: 320)});

  final Widget child;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    final Duration d =
        MediaQuery.of(context).disableAnimations ? Duration.zero : duration;
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: d,
      curve: Curves.easeOutCubic,
      builder: (BuildContext context, double t, Widget? c) => Opacity(
        opacity: t,
        child: Transform.translate(offset: Offset(0, (1 - t) * 8), child: c),
      ),
      child: child,
    );
  }
}

/// Continuity Coaching (Founder decision Q9): **at most one** contextual next step per
/// screen, shown only when it is genuinely valuable. A quiet fact, then the single next
/// step — calm, helpful, optional. A trusted advisor, never a feed: no gamification, no
/// manufactured streaks, no engagement hooks. Nia is a progress product, not an
/// engagement product.
class CoachingLine extends StatelessWidget {
  const CoachingLine({super.key, required this.fact, required this.next});

  /// A grounded fact about progress so far (e.g. "You kept ₹185 this month.").
  final String fact;

  /// The one next step worth taking (e.g. "use your ₹500 voucher before 30 July.").
  final String next;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Icon(Icons.arrow_forward, size: 14, color: NiaTokens.blue),
        const SizedBox(width: NiaTokens.s2),
        Expanded(
          child: Text.rich(TextSpan(
            style: const TextStyle(
                fontSize: 13, height: 1.35, color: NiaTokens.inkSecondary),
            children: <InlineSpan>[
              TextSpan(text: '$fact  '),
              const TextSpan(
                  text: 'Next: ',
                  style: TextStyle(
                      fontWeight: FontWeight.w700, color: NiaTokens.blue)),
              TextSpan(
                  text: next,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, color: NiaTokens.ink)),
            ],
          )),
        ),
      ],
    );
  }
}

/// The signature NiaBook motion made visible: a line moving from **waiting (○)** to
/// **true (✓)**. One-shot on mount — the hollow ○ crossfades and the ✓ scales in
/// (easeOutCubic), settling on ✓ so goldens capture the final, true state. Colour
/// carries state only: ○ is quiet grey, ✓ is the accent blue. Stagger multiple
/// lines with [duration] so a column plays the movement in sequence.
class MovementCheck extends StatelessWidget {
  const MovementCheck({
    super.key,
    this.size = 16,
    this.duration = const Duration(milliseconds: 520),
  });

  final double size;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    final Duration d =
        MediaQuery.of(context).disableAnimations ? Duration.zero : duration;
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: d,
      curve: Curves.easeOutCubic,
      builder: (BuildContext context, double t, Widget? _) => SizedBox(
        width: size,
        height: size,
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            Opacity(
              opacity: (1 - t).clamp(0.0, 1.0),
              child: Icon(Icons.radio_button_unchecked,
                  size: size, color: NiaTokens.inkSecondary),
            ),
            Opacity(
              opacity: t,
              child: Transform.scale(
                scale: 0.6 + 0.4 * t,
                child: Icon(Icons.check_circle, size: size, color: NiaTokens.blue),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
