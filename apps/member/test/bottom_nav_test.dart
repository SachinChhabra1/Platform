import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/shell/member_shell.dart';

/// The icon-first bottom navigation: four tabs (Home · Wallet · Family ·
/// Profile), each reachable, with a clear active state. Runs against the shell
/// offline (the Sample*Source default), so no backend is needed.

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
  testWidgets('renders four icon tabs: Home, Wallet, Family, Profile',
      (WidgetTester tester) async {
    await pumpShell(tester);
    for (final label in <String>['Home', 'Wallet', 'Family', 'Profile']) {
      expect(find.byTooltip(label), findsOneWidget);
    }
  });

  testWidgets('opens on Home with a clear active state (solid icon)',
      (WidgetTester tester) async {
    await pumpShell(tester);
    expect(find.text('Namaste, Ramesh'), findsOneWidget);
    // Home selected → solid icon; the others are quiet line icons.
    expect(find.byIcon(Icons.home), findsOneWidget);
    expect(find.byIcon(Icons.account_balance_wallet_outlined), findsOneWidget);
    expect(find.byIcon(Icons.people_outline), findsOneWidget);
    expect(find.byIcon(Icons.person_outline), findsOneWidget);
  });

  testWidgets('tapping each tab opens the right screen', (WidgetTester tester) async {
    await pumpShell(tester);

    await tester.tap(find.byTooltip('Wallet'));
    await tester.pumpAndSettle();
    expect(find.text('This month'), findsOneWidget);

    await tester.tap(find.byTooltip('Family'));
    await tester.pumpAndSettle();
    expect(find.text('The people your work is for.'), findsOneWidget);

    await tester.tap(find.byTooltip('Profile'));
    await tester.pumpAndSettle();
    expect(find.text('You decide every time.'), findsOneWidget);

    await tester.tap(find.byTooltip('Home'));
    await tester.pumpAndSettle();
    expect(find.text('Namaste, Ramesh'), findsOneWidget);
  });

  testWidgets('the active state moves to the tapped tab', (WidgetTester tester) async {
    await pumpShell(tester);
    // Home starts solid; Wallet quiet.
    expect(find.byIcon(Icons.home), findsOneWidget);
    expect(find.byIcon(Icons.account_balance_wallet), findsNothing);

    await tester.tap(find.byTooltip('Wallet'));
    await tester.pumpAndSettle();

    // Now Wallet is solid + labelled, and Home has gone quiet.
    expect(find.byIcon(Icons.account_balance_wallet), findsOneWidget);
    expect(find.byIcon(Icons.home_outlined), findsOneWidget);
    expect(find.byIcon(Icons.home), findsNothing);
  });
}
