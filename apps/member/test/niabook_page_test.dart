import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';
import 'package:member/features/pillars/nia_components.dart';

/// NiaBook — the approved two-column design. Left proves what became true; right
/// shows more you can keep, found by RafiQi. Guard the architecture and the
/// non-negotiable copy, and that SOS reaches a human.

void phone(WidgetTester tester) {
  tester.view.physicalSize = const Size(390, 2200);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Future<void> pump(WidgetTester tester) async {
  phone(tester);
  await tester.pumpWidget(
    const MaterialApp(home: Scaffold(body: SafeArea(child: NiaBookPage()))),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('top area: title, identity, month, summary, status',
      (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('NiaBook'), findsOneWidget);
    expect(find.text('Hi, Ramesh'), findsOneWidget);
    expect(find.text('June 2025'), findsOneWidget);
    expect(
      find.textContaining('more stayed with you than in May', findRichText: true),
      findsOneWidget,
    );
    expect(find.text('4 unlocked'), findsOneWidget);
    expect(find.text('9 waiting'), findsOneWidget);
  });

  testWidgets('left column proves what became true', (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('WHAT BECAME TRUE'), findsOneWidget);
    expect(find.text('Your progress.'), findsOneWidget);
    expect(find.text('₹5,000'), findsOneWidget);
    expect(find.text('Reached your family'), findsOneWidget);
    expect(find.text('₹185'), findsOneWidget);
    expect(find.text('Saved at Sukh Store'), findsOneWidget);
    expect(find.text('You are ₹300 ahead of May.'), findsOneWidget);
    expect(find.text('THIS WEEK AT SUKH'), findsOneWidget);
    expect(find.text('See all offers'), findsOneWidget);
  });

  testWidgets('right column is opportunity, found by RafiQi',
      (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('MORE YOU CAN KEEP'), findsOneWidget);
    expect(
      find.textContaining('Found by', findRichText: true),
      findsOneWidget,
    );
    expect(find.text('BEST GAIN'), findsOneWidget);
    expect(find.text('+₹2,500/mo'), findsOneWidget);
    expect(find.text('Machine Operator'), findsOneWidget);
    expect(find.text('Ready now'), findsOneWidget);
    expect(find.textContaining('Locked · 6 months experience'), findsOneWidget);
    expect(find.text('See all opportunities (9)'), findsOneWidget);
  });

  testWidgets('plays the ○→✓ movement (status tally + became-true lines)',
      (WidgetTester tester) async {
    await pump(tester);
    // R1: the signature waiting→true motion is visible in more than one place —
    // the "unlocked" tally and each line that became true.
    expect(find.byType(MovementCheck), findsAtLeastNWidgets(2));
  });

  testWidgets('closes with one Continuity Coaching line (Q9)',
      (WidgetTester tester) async {
    await pump(tester);
    expect(find.byType(CoachingLine), findsOneWidget);
    expect(find.textContaining('Next:'), findsOneWidget);
  });

  testWidgets('SOS reaches a human in one tap', (WidgetTester tester) async {
    await pump(tester);
    await tester.tap(find.text('SOS'));
    await tester.pumpAndSettle();
    expect(find.text('Your Operator'), findsOneWidget);
  });
}
