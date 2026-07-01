import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/shell/member_shell.dart';

/// The icon-first bottom navigation: four tabs (NiaBook · Home · Family · Me),
/// each reachable, with a clear active state. **NiaBook leads and the app opens
/// on it.** Runs against the shell offline (the Sample*Source default), so no
/// backend is needed.

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1200, 4000);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Future<void> pumpShell(WidgetTester tester) async {
  tall(tester);
  await tester.pumpWidget(const MaterialApp(home: MemberShell(config: MemberConfig())));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('renders four icon tabs: NiaBook, Home, Family, Me',
      (WidgetTester tester) async {
    await pumpShell(tester);
    for (final label in <String>['NiaBook', 'Home', 'Family', 'Me']) {
      expect(find.byTooltip(label), findsOneWidget);
    }
  });

  testWidgets('opens on NiaBook with a clear active state (solid book icon)',
      (WidgetTester tester) async {
    await pumpShell(tester);
    // NiaBook is the first screen — its verdict is on the page.
    expect(find.text('June was worth it.'), findsOneWidget);
    // NiaBook selected → solid book icon; the others are quiet line icons.
    expect(find.byIcon(Icons.menu_book), findsOneWidget);
    expect(find.byIcon(Icons.home_outlined), findsOneWidget);
    expect(find.byIcon(Icons.people_outline), findsOneWidget);
    expect(find.byIcon(Icons.person_outline), findsOneWidget);
  });

  testWidgets('tapping each tab opens the right screen', (WidgetTester tester) async {
    await pumpShell(tester);

    await tester.tap(find.byTooltip('Home'));
    await tester.pumpAndSettle();
    expect(find.text('Namaste, Ramesh'), findsOneWidget);

    await tester.tap(find.byTooltip('Family'));
    await tester.pumpAndSettle();
    expect(find.text('The people your work is for.'), findsOneWidget);

    await tester.tap(find.byTooltip('Me'));
    await tester.pumpAndSettle();
    expect(find.text('You decide every time.'), findsOneWidget);

    await tester.tap(find.byTooltip('NiaBook'));
    await tester.pumpAndSettle();
    expect(find.text('June was worth it.'), findsOneWidget);
  });

  testWidgets('the active state moves to the tapped tab', (WidgetTester tester) async {
    await pumpShell(tester);
    // NiaBook starts solid; Home quiet.
    expect(find.byIcon(Icons.menu_book), findsOneWidget);
    expect(find.byIcon(Icons.home), findsNothing);

    await tester.tap(find.byTooltip('Home'));
    await tester.pumpAndSettle();

    // Now Home is solid + labelled, and NiaBook has gone quiet.
    expect(find.byIcon(Icons.home), findsOneWidget);
    expect(find.byIcon(Icons.menu_book_outlined), findsOneWidget);
    expect(find.byIcon(Icons.menu_book), findsNothing);
  });
}
