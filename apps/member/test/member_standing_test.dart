import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/membership/member_standing.dart';
import 'package:nia_api/api.dart';

/// The Member's standing (Q2 resolved): show the state, calm for Active and
/// careful/action-helpful for Paused/Closed. These assert the copy and the
/// action affordance per state — the dignity is in the words, so the words are
/// tested.

Widget _host(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  testWidgets('Active reads as a calm affirmation, with NO Operator action',
      (WidgetTester tester) async {
    await tester.pumpWidget(_host(MemberStanding(
      state: MembershipState.member,
      onOperator: () {},
    )));
    expect(find.text('An active Member of Nia'), findsOneWidget);
    expect(find.text('Talk to your Operator'), findsNothing);
  });

  testWidgets('Paused is reassuring and offers the Operator (continuity, FD-4)',
      (WidgetTester tester) async {
    await tester.pumpWidget(_host(MemberStanding(
      state: MembershipState.paused,
      onOperator: () {},
    )));
    expect(find.text('Your membership is paused'), findsOneWidget);
    expect(find.textContaining("stays yours"), findsOneWidget);
    expect(find.text('Talk to your Operator'), findsOneWidget);
  });

  testWidgets('Closed is dignified — welcome back, never a failure',
      (WidgetTester tester) async {
    await tester.pumpWidget(_host(MemberStanding(
      state: MembershipState.closed,
      onOperator: () {},
    )));
    expect(find.text('Your membership has ended'), findsOneWidget);
    expect(find.textContaining('welcome back'), findsOneWidget);
    expect(find.text('Talk to your Operator'), findsOneWidget);
  });

  testWidgets('the Operator action fires its callback', (WidgetTester tester) async {
    var tapped = false;
    await tester.pumpWidget(_host(MemberStanding(
      state: MembershipState.paused,
      onOperator: () => tapped = true,
    )));
    await tester.tap(find.text('Talk to your Operator'));
    expect(tapped, isTrue);
  });

  testWidgets('compact omits the subline but keeps the action when it helps',
      (WidgetTester tester) async {
    await tester.pumpWidget(_host(MemberStanding(
      state: MembershipState.paused,
      compact: true,
      onOperator: () {},
    )));
    expect(find.text('Your membership is paused'), findsOneWidget);
    expect(find.textContaining('stays yours'), findsNothing); // no subline in compact
    expect(find.text('Talk to your Operator'), findsOneWidget);
  });
}
