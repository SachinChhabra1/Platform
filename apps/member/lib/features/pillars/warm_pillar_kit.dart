/// Warm pillar kit — the shared components every pillar renders in the NiaBook
/// warm language (cream / terracotta), translated from the v0 prototype's
/// `components/nia/ui.tsx` + `mobile-shell.tsx`. One kit so Work / Living / Sukh /
/// Family / Me stay consistent (product law 1) as they migrate off the blue system.
///
/// Colour still carries meaning only (positive/info/caution/neutral); SOS stays on
/// every screen (safety law) via [WarmScreen]'s header.
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';

/// Pill tone → (foreground, background). Meaning only, never decoration.
enum WarmTone { positive, info, caution, neutral }

({Color fg, Color bg}) _toneColors(WarmTone tone) => switch (tone) {
      WarmTone.positive => (fg: NiaTokens.homePositive, bg: NiaTokens.homePositiveSoft),
      WarmTone.info => (fg: NiaTokens.homeInfo, bg: NiaTokens.homeInfoSoft),
      WarmTone.caution => (fg: NiaTokens.homeCaution, bg: NiaTokens.homeCautionSoft),
      WarmTone.neutral => (fg: NiaTokens.homeMuted, bg: NiaTokens.homeSecondary),
    };

/// A pillar screen: warm ground, an owned header (title + subtitle + SOS), and a
/// scrolling body with a consistent gap between blocks.
class WarmScreen extends StatelessWidget {
  const WarmScreen({super.key, required this.title, required this.subtitle, required this.children});

  final String title;
  final String subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: NiaTokens.homeGround,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          _header(context),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(NiaTokens.s4, NiaTokens.s4, NiaTokens.s4, NiaTokens.s7),
              itemCount: children.length,
              separatorBuilder: (_, _) => const SizedBox(height: NiaTokens.s5),
              itemBuilder: (_, i) => children[i],
            ),
          ),
        ],
      ),
    );
  }

  Widget _header(BuildContext context) => DecoratedBox(
        decoration: const BoxDecoration(
          color: NiaTokens.homeGround,
          border: Border(bottom: BorderSide(color: NiaTokens.homeBorder)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(NiaTokens.s4, NiaTokens.s5, NiaTokens.s4, NiaTokens.s3),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
                    Text(subtitle, style: const TextStyle(fontSize: 14, color: NiaTokens.homeMuted)),
                  ],
                ),
              ),
              const WarmSos(),
            ],
          ),
        ),
      );
}

/// SOS — a warm pill that reaches help on every screen (never red-as-alarm chrome;
/// the prototype's destructive tint, kept for one-tap safety). Accessible button
/// labelled "SOS".
class WarmSos extends StatelessWidget {
  const WarmSos({super.key});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'SOS',
      child: Material(
        color: NiaTokens.homeCard,
        shape: const StadiumBorder(side: BorderSide(color: NiaTokens.homeBorder)),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: () => openNiaEmergency(context),
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: NiaTokens.s3, vertical: NiaTokens.s2),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(Icons.warning_amber_rounded, size: 15, color: NiaTokens.homeDanger),
                SizedBox(width: NiaTokens.s1),
                ExcludeSemantics(child: Text('SOS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NiaTokens.homeInk))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// The signature connective card — what you did here becomes part of your NiaBook.
/// Same placement on every pillar; always points home.
class NiaBookStrip extends StatelessWidget {
  const NiaBookStrip({super.key, required this.note});

  final String note;

  @override
  Widget build(BuildContext context) {
    return Container(
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
            decoration: const BoxDecoration(color: NiaTokens.homePrimary, shape: BoxShape.circle),
            child: const Icon(Icons.menu_book, size: 18, color: NiaTokens.homeOnPrimary),
          ),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text('UPDATES YOUR NIABOOK',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.3, color: NiaTokens.homePrimary)),
                const SizedBox(height: NiaTokens.s1),
                Text(note, style: const TextStyle(fontSize: 14, height: 1.3, color: NiaTokens.homeInk)),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward, size: 16, color: NiaTokens.homePrimary),
        ],
      ),
    );
  }
}

/// A section heading with an optional trailing action label.
class WarmSectionTitle extends StatelessWidget {
  const WarmSectionTitle(this.title, {super.key, this.action});

  final String title;
  final String? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: NiaTokens.s3),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(title.toUpperCase(),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: NiaTokens.homeMuted)),
          ),
          if (action != null)
            Text(action!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: NiaTokens.homePrimary)),
        ],
      ),
    );
  }
}

/// A white warm card.
class WarmCard extends StatelessWidget {
  const WarmCard({super.key, required this.child, this.padding = const EdgeInsets.all(NiaTokens.s4)});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: NiaTokens.homeCard, borderRadius: BorderRadius.circular(20), border: Border.all(color: NiaTokens.homeBorder)),
      child: ClipRRect(borderRadius: BorderRadius.circular(20), child: Padding(padding: padding, child: child)),
    );
  }
}

/// A small status pill (meaning only).
class WarmStatusPill extends StatelessWidget {
  const WarmStatusPill(this.label, {super.key, this.tone = WarmTone.neutral, this.icon});

  final String label;
  final WarmTone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = _toneColors(tone);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: c.bg, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (icon != null) ...<Widget>[Icon(icon, size: 13, color: c.fg), const SizedBox(width: 4)],
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: c.fg)),
        ],
      ),
    );
  }
}

/// A labelled stat (caps label + value + optional sub).
class WarmStat extends StatelessWidget {
  const WarmStat({super.key, required this.label, required this.value, this.sub, this.subTone = WarmTone.neutral});

  final String label;
  final String value;
  final String? sub;
  final WarmTone subTone;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(label, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
        const SizedBox(height: NiaTokens.s1),
        Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
        if (sub != null)
          Text(sub!, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: _toneColors(subTone).fg)),
      ],
    );
  }
}

/// A list row: icon chip + title + subtitle + optional trailing.
class WarmListRow extends StatelessWidget {
  const WarmListRow({super.key, this.icon, required this.title, this.subtitle, this.trailing, this.onTap});

  final IconData? icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final row = Padding(
      padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3),
      child: Row(
        children: <Widget>[
          if (icon != null) ...<Widget>[
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(color: NiaTokens.homeSecondary, shape: BoxShape.circle),
              child: Icon(icon, size: 18, color: NiaTokens.homeMuted),
            ),
            const SizedBox(width: NiaTokens.s3),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                if (subtitle != null)
                  Text(subtitle!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
              ],
            ),
          ),
          if (trailing != null) ...<Widget>[const SizedBox(width: NiaTokens.s2), trailing!] else if (onTap != null)
            const Icon(Icons.chevron_right, size: 16, color: NiaTokens.homeMuted),
        ],
      ),
    );
    if (onTap == null) return row;
    return InkWell(onTap: onTap, child: row);
  }
}

/// A hairline divider inside a card.
class WarmDivider extends StatelessWidget {
  const WarmDivider({super.key});

  @override
  Widget build(BuildContext context) => const Divider(height: 1, thickness: 1, color: NiaTokens.homeBorder);
}

/// A "why now" timing chip — the rationale attached to a recommendation.
class WarmWhyNow extends StatelessWidget {
  const WarmWhyNow(this.text, {super.key, this.onDark = false});

  final String text;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final Color bg = onDark ? NiaTokens.homeOnPrimary.withValues(alpha: 0.15) : NiaTokens.homeSecondary;
    final Color fg = onDark ? NiaTokens.homeGround : NiaTokens.homeInk;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s3, vertical: NiaTokens.s2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(Icons.schedule, size: 14, color: fg),
          const SizedBox(width: NiaTokens.s2),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: TextStyle(fontSize: 12, height: 1.4, color: fg),
                children: <TextSpan>[const TextSpan(text: 'Why now · ', style: TextStyle(fontWeight: FontWeight.w700)), TextSpan(text: text)],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A slim progress bar (upskilling, goals).
class WarmProgressBar extends StatelessWidget {
  const WarmProgressBar(this.fraction, {super.key});

  final double fraction;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: LinearProgressIndicator(
        value: fraction.clamp(0.0, 1.0),
        minHeight: 8,
        backgroundColor: NiaTokens.homeSecondary,
        valueColor: const AlwaysStoppedAnimation<Color>(NiaTokens.homePrimary),
      ),
    );
  }
}
