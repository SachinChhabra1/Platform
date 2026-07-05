/// Family · the emotional centre — how to take better care of home. Warm NiaBook
/// design (v0 prototype, migrated 2026-07-05). Deliberately NOT the prototype's
/// money screen: the locked architecture is explicit that Family is care, not a
/// remittance/payments screen, and every block answers "how are the people I left
/// home for?". People come first; money is one way, shown after; the close lands
/// on purpose, not finance.
///
/// The ONE contract-backed fact — money that reached home this month — is wired
/// LIVE via [RemittanceSource] with loading / empty / error / success states.
/// Everything else (people, goals, protection) has no backend read-model yet and
/// is sample.
library;

import 'package:flutter/material.dart';

import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../niabook/niabook_scenario.dart' show formatPaise;
import '../remittance/remittance_source.dart';
import 'warm_pillar_kit.dart';

class FamilyPage extends StatelessWidget {
  const FamilyPage({super.key, this.remittance = const SampleRemittanceSource()});

  /// The remittance source for the "reached home" fact — live when configured.
  final RemittanceSource remittance;

  @override
  Widget build(BuildContext context) {
    return WarmScreen(
      title: 'Family',
      subtitle: 'How are the people you left home for?',
      children: <Widget>[
        const NiaBookStrip(note: 'Every month you show up for home becomes part of your NiaBook.'),
        _people(context),
        _ReachedHome(source: remittance),
        _goal(),
        _protection(),
      ],
    );
  }

  // ── People — the hero (care, not money) ─────────────────────────────────────
  Widget _people(BuildContext context) => WarmCard(
        padding: const EdgeInsets.symmetric(horizontal: NiaTokens.s4),
        child: Column(
          children: <Widget>[
            _person(context, 'A', 'Mother', 'Amma', 'Healthy'),
            const WarmDivider(),
            _person(context, 'A', 'Father', 'Appa', 'Healthy'),
            const WarmDivider(),
            _person(context, 'R', 'Ravi', 'Son · Class 6', 'Fees paid'),
          ],
        ),
      );

  Widget _person(BuildContext context, String initials, String name, String detail, String status) => Semantics(
        button: true,
        label: '$name, $detail. $status.',
        excludeSemantics: true,
        child: InkWell(
          onTap: () => prototypeNoOp(context, name),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: NiaTokens.s3),
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 20,
                  backgroundColor: NiaTokens.homeSecondary,
                  child: Text(initials, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
                ),
                const SizedBox(width: NiaTokens.s3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                      Text(detail, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                    ],
                  ),
                ),
                const Icon(Icons.check_circle, size: 18, color: NiaTokens.homePositive),
                const SizedBox(width: 4),
                Text(status, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
              ],
            ),
          ),
        ),
      );

  // ── Goal — the cross-pillar flywheel, felt without a diagram ────────────────
  Widget _goal() => WarmCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(color: NiaTokens.homeSecondary, shape: BoxShape.circle),
                  child: const Icon(Icons.school_outlined, size: 18, color: NiaTokens.homePrimary),
                ),
                const SizedBox(width: NiaTokens.s3),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text("Ravi's school fees", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                      Text('Due 15 July', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
                    ],
                  ),
                ),
                Text(formatPaise(120000), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
              ],
            ),
            const SizedBox(height: NiaTokens.s3),
            const WarmDivider(),
            const SizedBox(height: NiaTokens.s3),
            Text.rich(
              TextSpan(
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5, color: NiaTokens.homeMuted),
                children: const <TextSpan>[
                  TextSpan(text: 'COVERED BY · '),
                  TextSpan(text: 'found by RafiQi', style: TextStyle(color: NiaTokens.homePrimary)),
                ],
              ),
            ),
            const SizedBox(height: NiaTokens.s2),
            _cover('Two overtime shifts', 'Work'),
            _cover('A Machine Operator promotion', 'Work'),
            _cover('Four months of Sukh savings', 'Sukh'),
          ],
        ),
      );

  Widget _cover(String title, String tag) => Semantics(
        label: '$title, from $tag',
        excludeSemantics: true,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: NiaTokens.s2),
          child: Row(
            children: <Widget>[
              const Icon(Icons.check_circle, size: 18, color: NiaTokens.homePositive),
              const SizedBox(width: NiaTokens.s3),
              Expanded(child: Text(title, style: const TextStyle(fontSize: 13, color: NiaTokens.homeInk))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: NiaTokens.homePrimary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                child: Text(tag, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: NiaTokens.homePrimary)),
              ),
            ],
          ),
        ),
      );

  // ── Protection — reassurance, never a product menu ──────────────────────────
  Widget _protection() => WarmCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text('Your family is protected', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
            const SizedBox(height: NiaTokens.s4),
            Row(
              children: const <Widget>[
                Expanded(child: _ProtTile(Icons.verified_user_outlined, 'Insurance', 'Active')),
                Expanded(child: _ProtTile(Icons.medical_services_outlined, 'Medical', 'Covered')),
                Expanded(child: _ProtTile(Icons.savings_outlined, 'Emergency fund', 'Ready')),
              ],
            ),
          ],
        ),
      );
}

class _ProtTile extends StatelessWidget {
  const _ProtTile(this.icon, this.label, this.status);
  final IconData icon;
  final String label;
  final String status;

  @override
  Widget build(BuildContext context) => Column(
        children: <Widget>[
          Icon(icon, size: 20, color: NiaTokens.homePrimary),
          const SizedBox(height: NiaTokens.s2),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: NiaTokens.homeMuted)),
          Text(status, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
        ],
      );
}

/// The one contract-backed fact — money that reached home this month — wired LIVE
/// via [RemittanceSource], with the full loading / empty / error / success states.
class _ReachedHome extends StatefulWidget {
  const _ReachedHome({required this.source});
  final RemittanceSource source;

  @override
  State<_ReachedHome> createState() => _ReachedHomeState();
}

class _ReachedHomeState extends State<_ReachedHome> {
  late Future<List<RemittanceView>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.source.list();
  }

  void _retry() => setState(() => _future = widget.source.list());

  @override
  Widget build(BuildContext context) {
    return WarmCard(
      child: FutureBuilder<List<RemittanceView>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) return _loading();
          if (snap.hasError) return _error();
          final confirmed = (snap.data ?? const <RemittanceView>[]).where((r) => r.isConfirmed).toList();
          if (confirmed.isEmpty) return _empty();
          final total = confirmed.fold<int>(0, (sum, r) => sum + r.amount.minor);
          return _success(total);
        },
      ),
    );
  }

  Widget _frame(Widget trailing, {required Widget title, required String sub}) => Row(
        children: <Widget>[
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(color: NiaTokens.homePrimary, shape: BoxShape.circle),
            child: const Icon(Icons.volunteer_activism, size: 18, color: NiaTokens.homeOnPrimary),
          ),
          const SizedBox(width: NiaTokens.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[title, Text(sub, style: const TextStyle(fontSize: 12, color: NiaTokens.homeMuted))],
            ),
          ),
          trailing,
        ],
      );

  Widget _loading() => _frame(
        const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: NiaTokens.homePrimary)),
        title: const Text('Checking money sent home…', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
        sub: 'One moment',
      );

  Widget _error() => Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const <Widget>[
                Text("Couldn't check money sent home", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
                Text('Your money is safe — this is only the view.', style: TextStyle(fontSize: 12, color: NiaTokens.homeMuted)),
              ],
            ),
          ),
          TextButton(onPressed: _retry, child: const Text('Try again', style: TextStyle(color: NiaTokens.homePrimary, fontWeight: FontWeight.w600))),
        ],
      );

  Widget _empty() => _frame(
        const SizedBox.shrink(),
        title: const Text('No money sent home yet', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
        sub: 'Nothing this month — send when you’re ready',
      );

  Widget _success(int totalPaise) => _frame(
        Row(
          mainAxisSize: MainAxisSize.min,
          children: const <Widget>[
            Icon(Icons.check_circle, size: 18, color: NiaTokens.homePositive),
            SizedBox(width: 4),
            Text('Reached home', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: NiaTokens.homeInk)),
          ],
        ),
        title: Text(formatPaise(totalPaise), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: NiaTokens.homeInk)),
        sub: 'reached home this month',
      );
}
