import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/membership/membership_header.dart';
import 'package:member/features/membership/membership_source.dart';
import 'package:nia_api/api.dart';

/// Slice-2 guard tests for the Membership Flutter surface: the identity header
/// renders the Member by name from the read model, never surfaces the lifecycle
/// state (Q2 open), and the generated client parses the HTTP wire format.

class _Fake implements MembershipSource {
  _Fake(this._v);
  final MembershipView _v;
  @override
  Future<MembershipView> currentMembership() async => _v;
}

MembershipView _view(MembershipState state) =>
    MembershipView(membershipId: 'm-001', name: 'Ramesh Kumar', state: state);

Future<void> _pump(WidgetTester tester, MembershipSource source) async {
  await tester.pumpWidget(
    MaterialApp(home: Scaffold(body: MembershipHeader(source: source))),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('renders the Member by name (§3, known by name)',
      (WidgetTester tester) async {
    await _pump(tester, _Fake(_view(MembershipState.member)));
    expect(find.text('Ramesh Kumar'), findsOneWidget);
    expect(find.text('A Member of Nia'), findsOneWidget);
  });

  testWidgets('does NOT surface the lifecycle state to the Member (Q2 open)',
      (WidgetTester tester) async {
    // Even a paused Member sees only name — state is "not shown until decided".
    await _pump(tester, _Fake(_view(MembershipState.paused)));
    expect(find.text('Ramesh Kumar'), findsOneWidget);
    expect(find.textContaining('paused', findRichText: true), findsNothing);
    expect(find.textContaining('Paused', findRichText: true), findsNothing);
  });

  test('generated client parses the /membership/me wire format', () {
    const wire = '{"membership_id":"m-001","name":"Ramesh Kumar","state":"member"}';
    final v = MembershipView.fromJson(jsonDecode(wire) as Map<String, dynamic>)!;
    expect(v.membershipId, 'm-001');
    expect(v.name, 'Ramesh Kumar');
    expect(v.state, MembershipState.member);
  });
}
