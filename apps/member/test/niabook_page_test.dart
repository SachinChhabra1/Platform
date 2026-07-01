import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_page.dart';

/// NiaBook — the Book of Months. Guard the three things that make it a category
/// and not a wallet: it opens with the verdict, it keeps the hero (money that
/// reached home and stayed his), it stays honest (the cost of being here), and
/// it makes the thesis visible (what Nia made smaller). Plus the five states the
/// board demo must show.

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1200, 4000);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Future<void> pump(WidgetTester tester) async {
  tall(tester);
  await tester.pumpWidget(
    const MaterialApp(home: Scaffold(body: NiaBookPage())),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('opens on the verdict, then the hero', (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('June was worth it.'), findsOneWidget);
    expect(find.text('₹5,000 reached home.'), findsOneWidget);
    expect(find.text('₹4,800 stayed with you.'), findsOneWidget);
    // The sum is present but quiet, not the hero.
    expect(
      find.textContaining('became yours and your family’s'),
      findsOneWidget,
    );
  });

  testWidgets('stays honest — shows the cost of being here',
      (WidgetTester tester) async {
    await pump(tester);
    expect(
      find.textContaining('cost of being here', findRichText: true),
      findsOneWidget,
    );
  });

  testWidgets('makes the thesis visible — what Nia made smaller',
      (WidgetTester tester) async {
    await pump(tester);
    expect(find.text('What Nia made smaller'), findsOneWidget);
    expect(
      find.textContaining('kept in your pocket at Sukh Store',
          findRichText: true),
      findsOneWidget,
    );
    expect(
      find.textContaining('voucher waiting for you'),
      findsOneWidget,
    );
  });

  testWidgets('the five states switch the Nia band', (WidgetTester tester) async {
    await pump(tester);

    // Redeemed voucher.
    await tester.tap(find.widgetWithText(ChoiceChip, 'Redeemed voucher'));
    await tester.pumpAndSettle();
    expect(find.textContaining('You used your ₹500 voucher'), findsOneWidget);

    // No shopping savings → the invitation.
    await tester.tap(find.widgetWithText(ChoiceChip, 'No shopping savings'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining('Shop at Sukh Store and Nia keeps more'),
      findsOneWidget,
    );

    // No work through Nia → the pull to work through Nia.
    await tester.tap(find.widgetWithText(ChoiceChip, 'No work through Nia'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining('Work through Nia to unlock'),
      findsOneWidget,
    );

    // Through all states the verdict and hero hold — the salary is his.
    expect(find.text('June was worth it.'), findsOneWidget);
    expect(find.text('₹5,000 reached home.'), findsOneWidget);
  });
}
