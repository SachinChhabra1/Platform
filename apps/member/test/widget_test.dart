import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/app.dart';
import 'package:member/features/niabook/niabook_page.dart';

/// Smoke tests for the Member shell: it boots on NiaBook (the first screen) and
/// carries the five anchors. Structure, not product behaviour.

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1170, 4000);
  tester.view.devicePixelRatio = 3.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

void main() {
  testWidgets('boots into the shell on NiaBook', (WidgetTester tester) async {
    tall(tester);
    await tester.pumpWidget(const NiaMemberApp());
    await tester.pumpAndSettle();

    expect(find.byType(NiaBookPage), findsOneWidget);
    expect(find.text('Ramesh Kumar Yadav'), findsOneWidget);
  });

  testWidgets('carries the five anchors', (WidgetTester tester) async {
    tall(tester);
    await tester.pumpWidget(const NiaMemberApp());
    await tester.pumpAndSettle();

    for (final label in <String>['NiaBook', 'Work', 'Living', 'Store', 'Family']) {
      expect(find.byTooltip(label), findsOneWidget);
    }
  });
}
