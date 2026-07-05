/// NiaBook — the home ledger (first tab, default). The single-column emotional
/// arc (v0 prototype, 2026-07-05), rendered as **live facts + derived story**
/// (Founder direction):
///   • TRUTH ([HomeFacts]) — the waterfall (earned/living/family/saved/kept),
///     savings balance, Floor protected. Live from the backend where configured.
///   • STORY ([HomeInsights]) — stronger-than-last-month, the momentum projection,
///     RafiQi's one next move. Derived in the client from the facts, never invented.
/// Indefensible metrics (percentile, lifetime-built) are deliberately omitted.
///
/// Warm cream/terracotta language (`NiaTokens.home*`); headline serif via the
/// `serifFamily` seam (system-font fallback until the Fraunces asset is bundled).
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'home_facts.dart';
import 'home_insights.dart';
import 'home_source.dart';
import 'niabook_scenario.dart' show formatPaise;

class NiaBookPage extends StatelessWidget {
  const NiaBookPage({super.key, this.source = const SampleHomeFactsSource()});

  final HomeFactsSource source;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: NiaTokens.homeGround,
      child: FutureBuilder<HomeFacts>(
        future: source.facts(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(NiaTokens.s5),
                child: Text("We couldn't load your NiaBook just now. Pull to try again.",
                    textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: NiaTokens.homeMuted)),
              ),
            );
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator(color: NiaTokens.homePrimary));
          }
          return _HomeView(facts: snapshot.data!, insights: deriveHomeInsights(snapshot.data!));
        },
      ),
    );
  }
}

/// The rendered home for a resolved set of facts + derived insights.
class _HomeView extends StatelessWidget {
  const _HomeView({required this.facts, required this.insights});

  final HomeFacts facts;
  final HomeInsights insights;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        _header(context),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(NiaTokens.s4, NiaTokens.s4, NiaTokens.s4, NiaTokens.s7),
            children: <Widget>[
              _identityRow(context),
              const SizedBox(height: NiaTokens.s6),
              _hero(context),
              const SizedBox(height: NiaTokens.s7),
              _story(context),
              const SizedBox(height: NiaTokens.s7),
              _attribution(context),
              const SizedBox(height: NiaTokens.s7),
              _journey(context),
              const SizedBox(height: NiaTokens.s7),
              _nextMove(context),
              const SizedBox(height: NiaTokens.s7),
              _identity(context),
            ],
          ),
        ),
      ],
    );
  }

  // ── Text styles ──────────────────────────────────────────────────────────
  static const TextStyle _caps = TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: NiaTokens.homeMuted);

  TextStyle _serif(double size, {FontWeight weight = FontWeight.w600, Color color = NiaTokens.homeInk, double height = 1.1}) =>
      TextStyle(fontFamily: NiaTokens.serifFamily, fontSize: size, fontWeight: weight, color: color, height: height);

  Widget _capsLabel(String text) => Text(text.toUpperCase(), style: _caps);

  // ── Header — wordmark + language ───────────────────────────────────────────
  Widget _header(BuildContext context) => DecoratedBox(
        decoration: const BoxDecoration(
          color: NiaTokens.homeGround,
          border: Border(bottom: BorderSide(color: NiaTokens.homeBorder)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(NiaTokens.s4, NiaTokens.s5, NiaTokens.s4, NiaTokens.s3),
          child: Row(
            children: <Widget>[
              Text('NiaBook', style: _serif(24, weight: FontWeight.w600, color: NiaTokens.homePrimary)),
              const Spacer(),
              _pill(
                onTap: () => prototypeNoOp(context, 'Language'),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Icon(Icons.language, size: 16, color: NiaTokens.homeInk),
                    SizedBox(width: NiaTokens.s1),
                    Text('English', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: NiaTokens.homeInk)),
                    Icon(Icons.expand_more, size: 16, color: NiaTokens.homeMuted),
                  ],
                ),
              ),
            ],
          ),
        ),
      );

  // ── Identity row ───────────────────────────────────────────────────────────
  Widget _identityRow(BuildContext context) => Row(
        children: <Widget>[
          CircleAvatar(
            radius: 20,
            backgroundColor: NiaTokens.homeSecondary,
            child: Text(_initials(facts.memberName), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
          ),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(facts.memberName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                Text(facts.memberSite, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
              ],
            ),
          ),
          const SizedBox(width: NiaTokens.s3),
          _pill(
            onTap: () => openNiaEmergency(context),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(Icons.warning_amber_rounded, size: 15, color: NiaTokens.homeDanger),
                SizedBox(width: NiaTokens.s1),
                Text('SOS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
              ],
            ),
          ),
        ],
      );

  // ── Hero — the single moment (headline DERIVED from the kept facts) ──────────
  Widget _hero(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          InkWell(
            onTap: () => prototypeNoOp(context, 'Choose month'),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(facts.monthLabel.toUpperCase(), style: _caps),
                const Icon(Icons.expand_more, size: 15, color: NiaTokens.homeMuted),
              ],
            ),
          ),
          const SizedBox(height: NiaTokens.s3),
          Text.rich(
            TextSpan(
              style: _serif(38, weight: FontWeight.w600, height: 1.08),
              children: <TextSpan>[
                TextSpan(text: insights.improved ? 'This month made you ' : 'This month you kept '),
                TextSpan(
                  text: formatPaise(insights.improved ? insights.strongerByPaise : facts.keptPaise),
                  style: _serif(38, weight: FontWeight.w600, color: NiaTokens.homePrimary, height: 1.08),
                ),
                TextSpan(text: insights.improved ? ' stronger.' : '.'),
              ],
            ),
          ),
          const SizedBox(height: NiaTokens.s4),
          const Text(
            'Every decision across Nia helps you earn more, keep more, save more, or support home. Your NiaBook shows how your life moved forward.',
            style: TextStyle(fontSize: 14, height: 1.5, color: NiaTokens.homeMuted),
          ),
          const SizedBox(height: NiaTokens.s5),
          _forecastCard(),
        ],
      );

  Widget _forecastCard() => Container(
        padding: const EdgeInsets.all(NiaTokens.s5),
        decoration: BoxDecoration(color: NiaTokens.homePrimary, borderRadius: BorderRadius.circular(20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text("You've built ${formatPaise(insights.builtThisMonthPaise)} this month",
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: NiaTokens.homeOnPrimary.withValues(alpha: 0.85))),
            const SizedBox(height: NiaTokens.s2),
            // A momentum projection — explicitly a RafiQi estimate, derived from the
            // recent kept trend (not a promise, not a stored number).
            Text('RafiQi estimates you can build ${formatPaise(insights.estimatedNextPaise)} next month.',
                style: _serif(24, weight: FontWeight.w600, color: NiaTokens.homeOnPrimary, height: 1.15)),
          ],
        ),
      );

  // ── The story — narrative waterfall (all TRUTH) ─────────────────────────────
  Widget _story(BuildContext context) {
    final List<_Flow> flow = <_Flow>[
      _Flow('You earned', facts.earnedPaise, _FlowKind.earned),
      _Flow('Living, all in', facts.livingPaise, _FlowKind.spent),
      _Flow('Sent to family', facts.familyPaise, _FlowKind.spent),
      _Flow('Saved at Sukh', facts.savedPaise, _FlowKind.added),
      _Flow('You kept', facts.keptPaise, _FlowKind.kept),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _capsLabel('This became true'),
        const SizedBox(height: NiaTokens.s1),
        const Text('How your month actually moved.', style: TextStyle(fontSize: 14, color: NiaTokens.homeMuted)),
        const SizedBox(height: NiaTokens.s4),
        for (int i = 0; i < flow.length; i++) _flowRow(flow[i], i == flow.length - 1),
      ],
    );
  }

  Widget _flowRow(_Flow step, bool isLast) {
    final bool isKept = step.kind == _FlowKind.kept;
    final String sign = switch (step.kind) { _FlowKind.added => '+', _FlowKind.spent => '−', _ => '' };
    final Color valueColor = switch (step.kind) {
      _FlowKind.kept => NiaTokens.homePrimary,
      _FlowKind.added => NiaTokens.homePositive,
      _FlowKind.earned => NiaTokens.homeInk,
      _FlowKind.spent => NiaTokens.homeMuted,
    };
    final Widget rail = Column(
      children: <Widget>[
        Container(
          margin: const EdgeInsets.only(top: 6),
          width: isKept ? 10 : 8,
          height: isKept ? 10 : 8,
          decoration: BoxDecoration(color: isKept ? NiaTokens.homePrimary : NiaTokens.homeBorder, shape: BoxShape.circle),
        ),
        if (!isLast) const Expanded(child: SizedBox(width: 1, child: ColoredBox(color: NiaTokens.homeBorder))),
      ],
    );
    final Widget label = Text(step.label,
        style: TextStyle(fontSize: isKept ? 16 : 14, fontWeight: isKept ? FontWeight.w600 : FontWeight.w400, color: isKept ? NiaTokens.homeInk : NiaTokens.homeMuted));
    final Widget value = isKept
        ? Text('$sign${formatPaise(step.amountPaise)}', style: _serif(22, weight: FontWeight.w600, color: valueColor))
        : Text('$sign${formatPaise(step.amountPaise)}',
            style: TextStyle(fontSize: step.kind == _FlowKind.earned ? 18 : 16, fontWeight: step.kind == _FlowKind.earned ? FontWeight.w700 : FontWeight.w600, color: valueColor));
    final Widget row = isKept
        ? Container(
            decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
            padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4, vertical: NiaTokens.s3),
            child: Row(children: <Widget>[Expanded(child: label), value]),
          )
        : Padding(padding: const EdgeInsets.only(bottom: NiaTokens.s5), child: Row(children: <Widget>[Expanded(child: label), value]));
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[SizedBox(width: 10, child: Center(child: rail)), const SizedBox(width: NiaTokens.s4), Expanded(child: row)],
      ),
    );
  }

  // ── Attribution — per-pillar contribution facts ─────────────────────────────
  Widget _attribution(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _capsLabel('Most of it came from'),
          const SizedBox(height: NiaTokens.s4),
          _card(
            child: Column(
              children: <Widget>[
                for (int i = 0; i < facts.contributions.length; i++) ...<Widget>[
                  if (i > 0) const Divider(height: 1, thickness: 1, color: NiaTokens.homeBorder),
                  _attributionRow(context, facts.contributions[i]),
                ],
              ],
            ),
          ),
        ],
      );

  Widget _attributionRow(BuildContext context, PillarContribution a) => InkWell(
        onTap: () => prototypeNoOp(context, 'Open ${a.label}'),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4, vertical: 14),
          child: Row(
            children: <Widget>[
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(color: NiaTokens.homePositiveSoft, shape: BoxShape.circle),
                child: const Icon(Icons.check, size: 14, color: NiaTokens.homePositive),
              ),
              const SizedBox(width: NiaTokens.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(a.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                    Text(a.detail, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                  ],
                ),
              ),
              const SizedBox(width: NiaTokens.s2),
              Text('+${formatPaise(a.gainPaise)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homePositive)),
              const Icon(Icons.chevron_right, size: 16, color: NiaTokens.homeMuted),
            ],
          ),
        ),
      );

  // ── Momentum — kept per month (facts) + derived trend ───────────────────────
  Widget _journey(BuildContext context) {
    final history = facts.keptHistory;
    final int maxKept = history.map((j) => j.keptPaise).reduce((a, b) => a > b ? a : b);
    final int minKept = history.map((j) => j.keptPaise).reduce((a, b) => a < b ? a : b);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _capsLabel('Your journey'),
                  const SizedBox(height: NiaTokens.s1),
                  const Text('What you keep, every month.', style: TextStyle(fontSize: 14, color: NiaTokens.homeMuted)),
                ],
              ),
            ),
            if (insights.improved)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  const Icon(Icons.north_east, size: 16, color: NiaTokens.homePositive),
                  const SizedBox(width: 2),
                  Text(formatPaise(insights.strongerByPaise), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homePositive)),
                ],
              ),
          ],
        ),
        const SizedBox(height: NiaTokens.s5),
        SizedBox(
          height: 160,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              for (int i = 0; i < history.length; i++) Expanded(child: _journeyBar(history[i], i == history.length - 1, minKept, maxKept)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _journeyBar(MonthKept j, bool isCurrent, int minKept, int maxKept) {
    final int span = (maxKept - minKept) == 0 ? 1 : (maxKept - minKept);
    final double frac = (0.45 + ((j.keptPaise - minKept) / span) * 0.55).clamp(0.0, 1.0);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: <Widget>[
          Text(formatPaise(j.keptPaise),
              style: TextStyle(fontSize: isCurrent ? 14 : 12, fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500, color: isCurrent ? NiaTokens.homeInk : NiaTokens.homeMuted)),
          const SizedBox(height: NiaTokens.s2),
          Expanded(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: FractionallySizedBox(
                heightFactor: frac,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isCurrent ? NiaTokens.homePrimary : NiaTokens.homePrimary.withValues(alpha: 0.25),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: NiaTokens.s2),
          Text(j.month, style: TextStyle(fontSize: 12, fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w400, color: isCurrent ? NiaTokens.homeInk : NiaTokens.homeMuted)),
        ],
      ),
    );
  }

  // ── RafiQi's next move (derived) ────────────────────────────────────────────
  Widget _nextMove(BuildContext context) {
    final move = insights.nextMove;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _capsLabel("RafiQi's next move"),
        const SizedBox(height: NiaTokens.s4),
        _card(
          padding: const EdgeInsets.all(NiaTokens.s5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(move.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, height: 1.3, color: NiaTokens.homeInk)),
              const SizedBox(height: NiaTokens.s2),
              Text(move.rationale, style: const TextStyle(fontSize: 14, height: 1.5, color: NiaTokens.homeMuted)),
              const SizedBox(height: NiaTokens.s4),
              _whyNow(move.whyNow),
              const SizedBox(height: NiaTokens.s5),
              const Divider(height: 1, thickness: 1, color: NiaTokens.homeBorder),
              const SizedBox(height: NiaTokens.s5),
              _capsLabel('Expected impact on your NiaBook'),
              const SizedBox(height: NiaTokens.s3),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(child: _impact('A year from now', '+${formatPaise(move.annualGainPaise)}', NiaTokens.homePrimary)),
                  Expanded(child: _impact('Likelihood', '${move.probabilityPct}%', NiaTokens.homeInk)),
                  Expanded(child: _impact('Time left', '${move.minutesLeft} min', NiaTokens.homeInk)),
                ],
              ),
              const SizedBox(height: NiaTokens.s5),
              _primaryButton(context, 'Start now'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _impact(String label, String value, Color valueColor) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
          const SizedBox(height: NiaTokens.s1),
          Text(value, style: _serif(20, weight: FontWeight.w600, color: valueColor)),
        ],
      );

  Widget _whyNow(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s3, vertical: NiaTokens.s2),
        decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(8)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Icon(Icons.schedule, size: 14, color: NiaTokens.homeInk),
            const SizedBox(width: NiaTokens.s2),
            Expanded(
              child: Text.rich(
                TextSpan(
                  style: const TextStyle(fontSize: 12, height: 1.4, color: NiaTokens.homeInk),
                  children: <TextSpan>[const TextSpan(text: 'Why now · ', style: TextStyle(fontWeight: FontWeight.w600)), TextSpan(text: text)],
                ),
              ),
            ),
          ],
        ),
      );

  Widget _primaryButton(BuildContext context, String label) => Material(
        color: NiaTokens.homePrimary,
        borderRadius: BorderRadius.circular(NiaTokens.radius),
        child: InkWell(
          borderRadius: BorderRadius.circular(NiaTokens.radius),
          onTap: () => prototypeNoOp(context, label),
          child: SizedBox(
            height: 48,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeOnPrimary)),
                const SizedBox(width: NiaTokens.s2),
                const Icon(Icons.arrow_forward, size: 16, color: NiaTokens.homeOnPrimary),
              ],
            ),
          ),
        ),
      );

  // ── Identity — who you're becoming (profile facts) ──────────────────────────
  Widget _identity(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _capsLabel("Who you're becoming"),
          const SizedBox(height: NiaTokens.s4),
          Row(
            children: <Widget>[
              for (int i = 0; i < facts.identity.length; i++) ...<Widget>[
                if (i > 0) const SizedBox(width: NiaTokens.s3),
                Expanded(child: _identityTile(facts.identity[i])),
              ],
            ],
          ),
        ],
      );

  Widget _identityTile(IdentityStat stat) => Container(
        padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s2, vertical: NiaTokens.s3),
        decoration: BoxDecoration(color: NiaTokens.homeSecondary, borderRadius: BorderRadius.circular(NiaTokens.radius)),
        child: Column(
          children: <Widget>[
            Text(stat.value, style: _serif(20, weight: FontWeight.w600)),
            const SizedBox(height: NiaTokens.s1),
            Text(stat.label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10.5, height: 1.15, color: NiaTokens.homeMuted)),
          ],
        ),
      );

  // ── Small shared pieces ────────────────────────────────────────────────────
  Widget _pill({required Widget child, required VoidCallback onTap}) => Material(
        color: NiaTokens.homeCard,
        shape: const StadiumBorder(side: BorderSide(color: NiaTokens.homeBorder)),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap,
          child: Padding(padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s3, vertical: NiaTokens.s2), child: child),
        ),
      );

  Widget _card({required Widget child, EdgeInsets? padding}) => Container(
        decoration: BoxDecoration(color: NiaTokens.homeCard, borderRadius: BorderRadius.circular(20), border: Border.all(color: NiaTokens.homeBorder)),
        child: ClipRRect(borderRadius: BorderRadius.circular(20), child: Padding(padding: padding ?? EdgeInsets.zero, child: child)),
      );

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
  }
}

enum _FlowKind { earned, spent, added, kept }

class _Flow {
  const _Flow(this.label, this.amountPaise, this.kind);
  final String label;
  final int amountPaise;
  final _FlowKind kind;
}
