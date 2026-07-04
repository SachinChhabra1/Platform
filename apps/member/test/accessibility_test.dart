import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/pillars/pillar_kit.dart';
import 'package:member/widgets/common.dart';

/// R9.4 — accessibility. Regression cover for the golden-neutral semantic fixes:
/// section labels are headers, the decorative monogram is not announced, and the
/// SOS control (on every screen) is a properly labelled button.

void main() {
  testWidgets('SectionLabel is announced as a header', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: SectionLabel('Your standing'))),
    );

    expect(
      tester.getSemantics(find.text('Your standing')),
      isSemantics(isHeader: true),
    );
    handle.dispose();
  });

  testWidgets('Monogram initials are decorative — painted but not announced', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: Monogram(initials: 'R')),
      ),
    );

    expect(find.text('R'), findsOneWidget); // still drawn on screen
    expect(find.bySemanticsLabel('R'), findsNothing); // never read aloud
    handle.dispose();
  });

  testWidgets('SOS is an accessible button labelled "SOS"', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: Builder(builder: niaSosButton)),
      ),
    );

    expect(
      tester.getSemantics(find.bySemanticsLabel('SOS')),
      isSemantics(isButton: true, label: 'SOS'),
    );
    handle.dispose();
  });
}
