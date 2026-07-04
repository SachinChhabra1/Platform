import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/pillars/family_page.dart';
import 'package:member/features/pillars/living_page.dart';
import 'package:member/features/pillars/nia_components.dart';
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

  testWidgets('Work · earn more', (WidgetTester tester) async {
    await pump(tester, const WorkPage());
    expect(find.text('Work'), findsOneWidget);
    expect(find.text('Earn more'), findsOneWidget);
    expect(find.text('CURRENT JOB'), findsOneWidget);
    expect(find.text('Machine Operator'), findsOneWidget);
    expect(find.text('Better jobs waiting'), findsOneWidget);
    // The hero is the +₹2,500/month opportunity, found by RafiQi.
    expect(find.textContaining('Higher-paying role · found by RafiQi'),
        findsOneWidget);
    expect(find.text('Certify to unlock — 20 minutes left'), findsOneWidget);
    // Benefit-led supporting rows (the gain leads, not the job title alone).
    expect(find.text('After your certification'), findsOneWidget);
    // The close is the economic chain that lands in NiaBook, not a bare label.
    expect(find.text('Certify, and you keep ₹2,500 more every month'),
        findsOneWidget);
    expect(find.textContaining('+₹500 Sukh voucher'), findsOneWidget);
    expect(find.textContaining('your NiaBook'), findsOneWidget);
    expect(find.text('SOS'), findsOneWidget);
  });

  testWidgets('Living · spend less', (WidgetTester tester) async {
    await pump(tester, const LivingPage());
    expect(find.text('Spend less'), findsOneWidget);
    expect(find.text('Umapathi Studio'), findsOneWidget);
    expect(find.text("THIS MONTH'S COST"), findsOneWidget);
    expect(find.text('Community'), findsOneWidget);
    // Benefit-led copy (Living helps the Member earn/keep, not a facilities menu).
    expect(find.text('Rest well. Work better tomorrow.'), findsOneWidget);
    expect(find.text('Meet workers. Hear of better jobs.'), findsOneWidget);
    // R1 #1: the middle carries the "spend less" feeling — every service reads as
    // Included (inside the ₹2,400, nothing extra), not just a facilities menu.
    expect(find.text('Included'), findsAtLeastNWidgets(6));
    // The outcome feeds NiaBook and returns time.
    expect(find.text('This month you kept ₹550 by living here'), findsOneWidget);
    expect(find.textContaining('~14 hours back'), findsOneWidget);
    // Terminology: it is a Nest, never a "room" (Nest → Coach → Studio → Theatre).
    expect(find.text('Nest 204'), findsOneWidget);
    expect(find.text('Your Nest'), findsOneWidget);
    expect(find.textContaining('room'), findsNothing);
    expect(find.textContaining('Room'), findsNothing);
  });

  testWidgets('Store · keep more', (WidgetTester tester) async {
    await pump(tester, const StorePage());
    expect(find.text('Keep more'), findsOneWidget);
    // The hero is money, found by RafiQi — the voucher, the flywheel's fuel.
    expect(find.text('Sukh voucher'), findsOneWidget);
    expect(find.textContaining('Sukh voucher · found by RafiQi'), findsOneWidget);
    // Every SKU answers "how much did I keep?" — the kept amount leads.
    expect(find.text("TODAY'S BASKET"), findsOneWidget);
    expect(find.text('YOU KEPT'), findsOneWidget);
    expect(find.text('Rice (5kg)'), findsOneWidget);
    expect(find.text('You kept ₹63 on today’s basket'), findsOneWidget);
    // Compounding — the thing only Store has.
    expect(find.text('SAVINGS, COMPOUNDING'), findsOneWidget);
    expect(find.text('This year'), findsOneWidget);
    expect(find.text('₹2,460'), findsOneWidget);
    // The close is literal money moving into NiaBook.
    expect(find.text('This month, ₹185 moved into your NiaBook'), findsOneWidget);
    // Not commerce: no "essentials you buy" shopping framing.
    expect(find.text('Essentials you buy'), findsNothing);
  });

  testWidgets('Family · take better care of home', (WidgetTester tester) async {
    await pump(tester, const FamilyPage());
    // Care, not remittance: the promise and the organising question.
    expect(find.text('Take better care of home'), findsOneWidget);
    expect(
        find.text('How are the people you left home for?'), findsOneWidget);
    // People come first — the hero is who, not how much.
    expect(find.text('Mother'), findsOneWidget);
    expect(find.text('Father'), findsOneWidget);
    expect(find.text('Ravi'), findsOneWidget);
    // Money comes only after people.
    expect(find.text('₹5,000'), findsOneWidget);
    expect(find.text('reached home this month'), findsOneWidget);
    // Goals are the cross-pillar flywheel, felt without a diagram.
    expect(find.text("Ravi's school fees"), findsOneWidget);
    expect(find.textContaining('Covered by · found by RafiQi'), findsOneWidget);
    expect(find.text('Two overtime shifts'), findsOneWidget);
    expect(find.text('Four months of Sukh savings'), findsOneWidget);
    expect(find.text('Work'), findsWidgets); // cross-pillar tags
    expect(find.text('Store'), findsOneWidget);
    // Protection reassures, never sells.
    expect(find.text('Your family is protected'), findsOneWidget);
    expect(find.text('Emergency fund'), findsOneWidget);
    // The close lands on purpose, not finance.
    expect(find.text('The people you left home for are doing better'),
        findsOneWidget);
    expect(find.text('This adds to your NiaBook'), findsNothing);
    expect(find.text('Send more home'), findsNothing);
  });

  testWidgets('every pillar closes with a NiaBook contribution and offers SOS',
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
      // Q9: exactly one Continuity Coaching line — a next step, never a hook.
      expect(find.byType(CoachingLine), findsOneWidget);
      expect(find.textContaining('Next:'), findsOneWidget);
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
