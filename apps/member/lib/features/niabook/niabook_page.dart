import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import 'niabook_scenario.dart';

/// NiaBook — the Book of Months. The first screen of the app and the artefact
/// that answers one question: **was leaving home worthwhile this month?**
///
/// Each month is a page. A page opens with a **verdict** (the answer, before any
/// number), then tells the story of where the salary went, then shows **what Nia
/// made smaller** — the cost-of-migration thesis made visible. It is not a
/// wallet, statement, passbook, tracker, or dashboard (frozen Concept A;
/// `docs/design/niabook/niabook-frozen-concept-a.md`).
///
/// The demo carries the Founder-accepted June scenario and the five states the
/// board must see; a quiet state switcher at the foot of the page steps through
/// them. Colour is state only: the reserved received green (Book III §2.1) marks
/// money that reached home, stayed his, or Nia kept in his pocket; everything
/// else is ink and grey.
class NiaBookPage extends StatefulWidget {
  const NiaBookPage({super.key, this.states = const <NiaBookMonth>[]});

  /// Overridable for tests; defaults to the Founder-accepted demo states.
  final List<NiaBookMonth> states;

  @override
  State<NiaBookPage> createState() => _NiaBookPageState();
}

class _NiaBookPageState extends State<NiaBookPage> {
  int _selected = 0;

  List<NiaBookMonth> get _states =>
      widget.states.isNotEmpty ? widget.states : NiaBookMonth.demoStates;

  @override
  Widget build(BuildContext context) {
    final NiaBookMonth m = _states[_selected];
    return ListView(
      padding: const EdgeInsets.fromLTRB(
          NiaTokens.s5, NiaTokens.s6, NiaTokens.s5, NiaTokens.s8),
      children: <Widget>[
        // Header — the month is the page.
        Text(m.monthLabel,
            style: const TextStyle(fontSize: 13, color: NiaTokens.inkSecondary)),
        const SizedBox(height: NiaTokens.s4),

        // The verdict — the answer, before any number.
        Text(m.verdict,
            style: const TextStyle(
                fontSize: 20, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        const SizedBox(height: NiaTokens.s4),

        // The hero — money that reached home, and money that stayed his. Two
        // concrete lines, no arithmetic; the sum sits quiet beneath.
        Text('${formatPaise(m.reachedHomePaise)} reached home.',
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        Text('${formatPaise(m.stayedWithYouPaise)} stayed with you.',
            style: const TextStyle(
                fontSize: 24, fontWeight: FontWeight.w600, color: NiaTokens.ink)),
        const SizedBox(height: NiaTokens.s2),
        Text(
          '${formatPaise(m.reachedHomePaise + m.stayedWithYouPaise)} of your '
          '${formatPaise(m.salaryPaise)} became yours and your family’s.',
          style: const TextStyle(fontSize: 13, color: NiaTokens.inkSecondary),
        ),

        _divider(),

        // The salary is real — in full, on time.
        _sentence(
          amount: formatPaise(m.salaryPaise),
          lead: 'Your ',
          rest: ' salary arrived, in full and on time.',
        ),
        const SizedBox(height: NiaTokens.s5),

        // Where the salary went — the three-pockets lens as ONE section, home
        // and kept first, the cost of being here last and framed as the toll Nia
        // works to lower.
        const SectionLabel('Where your salary went'),
        _storyLine(
          amount: formatPaise(m.reachedHomePaise),
          amountColor: NiaTokens.green,
          rest: ' reached your family back home.',
        ),
        _storyLine(
          amount: formatPaise(m.stayedWithYouPaise),
          amountColor: NiaTokens.green,
          rest: ' stayed with you. ${formatPaise(m.savedPortionPaise)} saved, '
              'the rest yours.',
        ),
        Padding(
          padding: const EdgeInsets.only(top: NiaTokens.s1, bottom: NiaTokens.s2),
          child: Text(
            'In your hand right now: ${formatPaise(m.inHandNowPaise)}.',
            style: const TextStyle(fontSize: 13, color: NiaTokens.inkSecondary),
          ),
        ),
        _storyLine(
          amount: formatPaise(m.costOfBeingHerePaise),
          amountColor: NiaTokens.inkSecondary,
          rest: ' was the cost of being here — the room and food Nia works '
              'to lower.',
        ),

        _divider(),

        // What Nia made smaller — the thesis on the page. State-dependent band.
        const SectionLabel('What Nia made smaller'),
        ..._niaBand(m),

        _divider(),

        // Progress — the point of a Book of Months.
        if (m.progressLine != null)
          Row(
            children: <Widget>[
              const Icon(Icons.trending_up, size: 18, color: NiaTokens.green),
              const SizedBox(width: NiaTokens.s2),
              Expanded(
                child: Text(m.progressLine!,
                    style: const TextStyle(
                        fontSize: 14, color: NiaTokens.inkSecondary)),
              ),
            ],
          ),
        const SizedBox(height: NiaTokens.s3),
        InkWell(
          onTap: () => prototypeNoOp(context, 'See earlier months'),
          child: const Padding(
            padding: EdgeInsets.symmetric(vertical: NiaTokens.s2),
            child: Text('See earlier months',
                style: TextStyle(fontSize: 13, color: NiaTokens.inkSecondary)),
          ),
        ),

        _divider(),

        // Demo-only: step the board through the five states.
        const SectionLabel('Demo · preview each state'),
        Wrap(
          spacing: NiaTokens.s2,
          runSpacing: NiaTokens.s2,
          children: <Widget>[
            for (int i = 0; i < _states.length; i++)
              ChoiceChip(
                label: Text(_states[i].demoLabel),
                selected: i == _selected,
                onSelected: (_) => setState(() => _selected = i),
              ),
          ],
        ),
      ],
    );
  }

  // The "what Nia made smaller" band, per state. Received green marks money Nia
  // kept in his pocket; grey marks a voucher waiting or an invitation.
  List<Widget> _niaBand(NiaBookMonth m) {
    final List<Widget> lines = <Widget>[];
    switch (m.band) {
      case NiaBandState.savingAndVoucher:
        lines.add(_niaLine(
          icon: Icons.trending_down,
          iconColor: NiaTokens.green,
          child: _storyLine(
            amount: formatPaise(m.sukhSavingPaise),
            amountColor: NiaTokens.green,
            rest: ' kept in your pocket at Sukh Store — money that would '
                'have gone to the market.',
          ),
        ));
        lines.add(_voucherWaiting(m));
        break;
      case NiaBandState.voucherWaiting:
        lines.add(_voucherWaiting(m));
        break;
      case NiaBandState.voucherRedeemed:
        lines.add(_niaLine(
          icon: Icons.check,
          iconColor: NiaTokens.green,
          child: Text(
            'You used your ${formatPaise(m.voucherPaise)} voucher — it '
            'stayed in your pocket.',
            style: const TextStyle(fontSize: 15, color: NiaTokens.ink),
          ),
        ));
        break;
      case NiaBandState.noSavingsInvite:
        lines.add(Padding(
          padding: const EdgeInsets.only(bottom: NiaTokens.s3),
          child: Text(
            'Shop at Sukh Store and Nia keeps more in your pocket.',
            style: const TextStyle(fontSize: 15, color: NiaTokens.inkSecondary),
          ),
        ));
        lines.add(_voucherWaiting(m));
        break;
      case NiaBandState.noNiaWork:
        lines.add(Text(
          'Work through Nia to unlock your ${formatPaise(m.voucherPaise)} '
          'voucher.',
          style: const TextStyle(fontSize: 15, color: NiaTokens.inkSecondary),
        ));
        break;
    }
    return lines;
  }

  Widget _voucherWaiting(NiaBookMonth m) => _niaLine(
        icon: Icons.confirmation_number_outlined,
        iconColor: NiaTokens.inkSecondary,
        child: Text(
          '${formatPaise(m.voucherPaise)} Sukh Store voucher waiting for you.',
          style: const TextStyle(fontSize: 15, color: NiaTokens.inkSecondary),
        ),
      );

  Widget _niaLine({
    required IconData icon,
    required Color iconColor,
    required Widget child,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: NiaTokens.s3),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Icon(icon, size: 18, color: iconColor),
            ),
            const SizedBox(width: NiaTokens.s2),
            Expanded(child: child),
          ],
        ),
      );

  // A story line: a coloured amount, then the rest of the sentence in ink.
  Widget _storyLine({
    required String amount,
    required Color amountColor,
    required String rest,
  }) =>
      Padding(
        padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
        child: Text.rich(
          TextSpan(
            style: const TextStyle(
                fontSize: 15, height: 1.4, color: NiaTokens.ink),
            children: <InlineSpan>[
              TextSpan(
                  text: amount,
                  style: TextStyle(
                      color: amountColor, fontWeight: FontWeight.w600)),
              TextSpan(text: rest),
            ],
          ),
        ),
      );

  // The lead sentence: "Your ₹14,000 salary arrived, in full and on time."
  Widget _sentence({
    required String amount,
    required String lead,
    required String rest,
  }) =>
      Text.rich(
        TextSpan(
          style: const TextStyle(fontSize: 15, height: 1.4, color: NiaTokens.ink),
          children: <InlineSpan>[
            TextSpan(text: lead),
            TextSpan(
                text: amount,
                style: const TextStyle(fontWeight: FontWeight.w600)),
            TextSpan(text: rest),
          ],
        ),
      );

  Widget _divider() => const Padding(
        padding: EdgeInsets.symmetric(vertical: NiaTokens.s5),
        child: Divider(height: 1, thickness: 1, color: NiaTokens.hairline),
      );
}
