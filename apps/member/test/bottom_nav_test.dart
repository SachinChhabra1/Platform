import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/shell/member_shell.dart';
import 'package:member/widgets/nia_bottom_nav.dart';

/// The icon-first bottom navigation: five tabs (NiaBook · Work · Living · Store ·
/// Family), each reachable, NiaBook first and default. The shell builds all tabs
/// in an IndexedStack, so nav assertions are scoped to the [NiaBottomNav]
/// subtree (the selected tab shows its label there).

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1170, 4000);
  tester.view.devicePixelRatio = 3.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

Future<void> pumpShell(WidgetTester tester) async {
  tall(tester);
  await tester.pumpWidget(const MaterialApp(home: MemberShell(config: MemberConfig())));
  await tester.pumpAndSettle();
}

Finder navLabel(String s) =>
    find.descendant(of: find.byType(NiaBottomNav), matching: find.text(s));

void main() {
  testWidgets('renders five icon tabs: NiaBook, Work, Living, Store, Family',
      (WidgetTester tester) async {
    await pumpShell(tester);
    for (final label in <String>['NiaBook', 'Work', 'Living', 'Store', 'Family']) {
      expect(find.byTooltip(label), findsOneWidget);
    }
  });

  testWidgets('opens on NiaBook', (WidgetTester tester) async {
    await pumpShell(tester);
    // NiaBook's own page header is present.
    expect(find.text('Hi, Ramesh'), findsOneWidget);
    // NiaBook is the selected tab (its label shows in the nav); others don't.
    expect(navLabel('NiaBook'), findsOneWidget);
    expect(navLabel('Work'), findsNothing);
  });

  testWidgets('tapping a tab moves the active state', (WidgetTester tester) async {
    await pumpShell(tester);
    expect(navLabel('NiaBook'), findsOneWidget);

    await tester.tap(find.byTooltip('Family'));
    await tester.pumpAndSettle();

    expect(navLabel('Family'), findsOneWidget);
    expect(navLabel('NiaBook'), findsNothing);
  });
}
