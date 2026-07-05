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

  testWidgets('un-migrated (blue) pillars still carry one Continuity Coaching line (Q9)',
      (WidgetTester tester) async {
    // Work and Living have migrated to the warm design. The remaining blue
    // pillars still use CoachingLine until they migrate in turn.
    for (final Widget page in <Widget>[
      const StorePage(),
      const FamilyPage(),
    ]) {
      await pump(tester, page);
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
