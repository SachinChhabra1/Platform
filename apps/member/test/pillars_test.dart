import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/pillars/family_page.dart';
import 'package:member/features/pillars/living_page.dart';
import 'package:member/features/pillars/pillar_kit.dart';
import 'package:member/features/pillars/store_page.dart';
import 'package:member/features/pillars/work_page.dart';

import 'support/test_fonts.dart';

/// The four pillars, built on the shared [PillarScaffold]. Each proves its
/// economic promise, carries the same semantic structure, and closes with a
/// "this improves/adds to your NiaBook" contribution. Layout follows the approved
/// deck screens.

void phone(WidgetTester tester) {
  tester.view.physicalSize = const Size(390, 2200);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Future<void> pump(WidgetTester tester, Widget page) async {
  phone(tester);
  await tester.pumpWidget(
    MaterialApp(
      theme: ThemeData(fontFamily: 'AppFont'),
      home: Scaffold(body: SafeArea(child: page)),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(loadRealFonts);

  testWidgets('Work · earn more (warm NiaBook design)', (WidgetTester tester) async {
    await pump(tester, const WorkPage());
    expect(find.text('Work'), findsOneWidget);
    expect(find.textContaining('Earn more'), findsOneWidget); // subtitle
    // Opens on the NiaBook strip — the pillar always points home.
    expect(find.text('UPDATES YOUR NIABOOK'), findsOneWidget);
    expect(find.textContaining('added +₹2,500 to what you kept'), findsOneWidget);
    // Reality: the protected contract + this month.
    expect(find.text('Prestige Constructions Pvt Ltd'), findsOneWidget);
    expect(find.text('Protected'), findsOneWidget);
    expect(find.text('Monthly wage'), findsOneWidget);
    expect(find.text('₹18,300'), findsOneWidget);
    expect(find.text('176 hrs'), findsOneWidget);
    expect(find.text('Your wage is guaranteed'), findsOneWidget);
    // Supporting: shifts + documents.
    expect(find.text('YOUR SHIFTS'), findsOneWidget);
    expect(find.text('Work permit'), findsOneWidget);
    // Opportunity: upskilling + the better-paying jobs RafiQi found.
    expect(find.text('GROW YOUR EARNING'), findsOneWidget);
    expect(find.text('Scaffolding Safety L2'), findsOneWidget);
    expect(find.text('3 better-paying jobs match you'), findsOneWidget);
    // SOS reaches help on every screen.
    expect(find.text('SOS'), findsOneWidget);
  });

  testWidgets('Living · keep more (warm NiaBook design)', (WidgetTester tester) async {
    await pump(tester, const LivingPage());
    expect(find.text('Living'), findsOneWidget);
    expect(find.textContaining('Keep more'), findsOneWidget); // subtitle
    // Opens on the NiaBook strip.
    expect(find.text('UPDATES YOUR NIABOOK'), findsOneWidget);
    expect(find.textContaining('kept +₹400'), findsOneWidget);
    // Reality: the Nest + the Living membership due (never "rent").
    expect(find.text('Nia Nest · Whitefield'), findsOneWidget);
    expect(find.text('Studio 4B · Nest 2'), findsOneWidget);
    expect(find.text('July Living membership'), findsOneWidget);
    expect(find.text('₹4,500'), findsOneWidget);
    expect(find.text('Pay now'), findsOneWidget);
    // Supporting: food plan, amenities, maintenance, notices.
    expect(find.text('Daily Curry Plan'), findsOneWidget);
    expect(find.text('AMENITIES'), findsOneWidget);
    expect(find.text('MAINTENANCE'), findsOneWidget);
    expect(find.text('Water heater not heating'), findsOneWidget);
    // SOS on every screen.
    expect(find.text('SOS'), findsOneWidget);
    // Vocabulary: Nest, never "room" (Nest → Coach → Studio → Theatre).
    expect(find.textContaining('room'), findsNothing);
    expect(find.textContaining('Room'), findsNothing);
  });

  testWidgets('Sukh · save more (warm NiaBook design)', (WidgetTester tester) async {
    await pump(tester, const StorePage());
    expect(find.text('Sukh'), findsOneWidget);
    expect(find.textContaining('Save more'), findsOneWidget); // subtitle
    // Opens on the NiaBook strip.
    expect(find.text('UPDATES YOUR NIABOOK'), findsOneWidget);
    expect(find.textContaining('saved you ₹620'), findsOneWidget);
    // Trust + the week's contribution to NiaBook.
    expect(find.text('Every item Nia-Certified'), findsOneWidget);
    expect(find.text('Added to your NiaBook this week'), findsOneWidget);
    // Every item leads with what it adds to the NiaBook.
    expect(find.text('Basmati Rice'), findsOneWidget);
    expect(find.text('₹340'), findsOneWidget);
    expect(find.textContaining('to your NiaBook'), findsWidgets);
    // SOS on every screen.
    expect(find.text('SOS'), findsOneWidget);
  });

  testWidgets('Family · care first (warm NiaBook design), reached-home live',
      (WidgetTester tester) async {
    await pump(tester, const FamilyPage());
    expect(find.text('Family'), findsOneWidget);
    // Care, not payments: the organising question leads.
    expect(find.text('How are the people you left home for?'), findsOneWidget);
    expect(find.text('UPDATES YOUR NIABOOK'), findsOneWidget);
    // People come first — the hero is who, not how much.
    expect(find.text('Mother'), findsOneWidget);
    expect(find.text('Father'), findsOneWidget);
    expect(find.text('Ravi'), findsOneWidget);
    // Money comes only after people — live from the remittance source (sample).
    expect(find.text('₹5,000'), findsOneWidget);
    expect(find.text('reached home this month'), findsOneWidget);
    // Goals are the cross-pillar flywheel, found by RafiQi.
    expect(find.text("Ravi's school fees"), findsOneWidget);
    expect(find.textContaining('found by RafiQi', findRichText: true), findsWidgets);
    expect(find.text('Two overtime shifts'), findsOneWidget);
    // Protection reassures, never sells.
    expect(find.text('Your family is protected'), findsOneWidget);
    expect(find.text('Emergency fund'), findsOneWidget);
    // Deliberately NOT the prototype's money screen (architecture: Family is care).
    expect(find.text('Ready to allocate'), findsNothing);
    expect(find.text('SOS'), findsOneWidget);
  });

  testWidgets('every pillar offers SOS and points at NiaBook',
      (WidgetTester tester) async {
    for (final Widget page in <Widget>[
      const WorkPage(),
      const LivingPage(),
      const StorePage(),
      const FamilyPage(),
    ]) {
      await pump(tester, page);
      expect(find.text('SOS'), findsOneWidget);
      expect(find.textContaining('NiaBook'), findsWidgets);
    }
  });

  test('PillarScaffold enforces all three body roles (no rogue structure)', () {
    // Only one role present → the contract assert must fire.
    expect(
      () => PillarScaffold(
        pillar: 'X',
        promise: 'Y',
        promiseSub: 'Z',
        body: <PillarBlock>[
          const PillarBlock(PillarSection.reality, SizedBox()),
        ],
        contribution: const SizedBox(),
      ),
      throwsAssertionError,
    );
  });
}
