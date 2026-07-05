import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';

/// NiaBook — the single-column emotional-arc home (v0 prototype, adopted
/// 2026-07-05). Guards the section architecture and the non-negotiable copy, and
/// that SOS reaches a human.

void phone(WidgetTester tester) {
  // Tall viewport so the whole scroll is laid out for finders.
  tester.view.physicalSize = const Size(390, 3000);
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
  testWidgets('header + identity + hero', (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('NiaBook'), findsOneWidget); // serif wordmark
    expect(find.text('Ramesh Kumar Yadav'), findsOneWidget);
    expect(find.text('Whitefield Site, Bengaluru'), findsOneWidget);
    expect(find.text('JUNE 2026'), findsOneWidget); // month selector (caps)
    expect(find.textContaining('stronger', findRichText: true), findsOneWidget);
    // "built this month" = this month's kept (a fact).
    expect(find.text("You've built ₹4,800 this month"), findsOneWidget);
    // The next-month figure is DERIVED (kept + average recent monthly gain), an
    // explicit RafiQi estimate — not the old invented ₹7,600.
    expect(find.text('RafiQi estimates you can build ₹5,083 next month.'), findsOneWidget);
    // Indefensible metrics (percentile / lifetime-built) are gone.
    expect(find.textContaining('built so far'), findsNothing);
    expect(find.textContaining('% of members'), findsNothing);
  });

  testWidgets('the story waterfall — earned to kept', (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('THIS BECAME TRUE'), findsOneWidget);
    expect(find.text('You earned'), findsOneWidget);
    expect(find.text('₹15,300'), findsOneWidget);
    expect(find.text('Sent to family'), findsOneWidget);
    expect(find.text('You kept'), findsOneWidget); // the emphasised line
  });

  testWidgets('attribution points back to the pillars', (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('MOST OF IT CAME FROM'), findsOneWidget);
    expect(find.text('Work'), findsOneWidget);
    expect(find.text('+₹2,500'), findsOneWidget);
    expect(find.text('Sukh'), findsOneWidget);
    expect(find.text('Living'), findsOneWidget);
  });

  testWidgets('momentum + RafiQi single next move (Continuity Coaching, Q9)',
      (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('YOUR JOURNEY'), findsOneWidget);
    expect(find.text("RAFIQI'S NEXT MOVE"), findsOneWidget);
    expect(find.text('Finish your Machine Operator certification'), findsOneWidget);
    expect(find.textContaining('Why now', findRichText: true), findsOneWidget);
    expect(find.text('+₹30,000'), findsOneWidget);
    expect(find.text('92%'), findsOneWidget);
    expect(find.text('Start now'), findsOneWidget);
  });

  testWidgets('identity closes the screen (no undefined lifetime aggregates)',
      (WidgetTester tester) async {
    await pump(tester);
    // "Since joining" lifetime aggregates are omitted for UAT (undefined metric).
    expect(find.text('SINCE JOINING NIA'), findsNothing);
    // Identity profile facts remain.
    expect(find.text("WHO YOU'RE BECOMING"), findsOneWidget);
    expect(find.text('Years in Nia'), findsOneWidget);
    expect(find.text('2.5'), findsOneWidget);
  });

  testWidgets('SOS reaches a human in one tap', (WidgetTester tester) async {
    await pump(tester);
    await tester.tap(find.text('SOS'));
    await tester.pumpAndSettle();
    expect(find.text('Your Operator'), findsOneWidget);
  });
}
