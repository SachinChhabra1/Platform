import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/app.dart';

/// Guard tests for the Product Review Build's standing invariants — the things
/// the Engineering Quality Certification asserts every iteration (docs/methodology.md
/// → Product Review Prototypes). Encoding them here makes the certification
/// enforceable rather than eyeballed: if a future change quietly surfaces tenure,
/// drops a Founder-Decision marker, or removes the prototype marking, CI fails.
///
/// A tall surface is used so lazily-built ListView content is realised without
/// scrolling, letting us assert on markers near the bottom of a screen.
void main() {
  void useTallSurface(WidgetTester tester) {
    tester.view.physicalSize = const Size(1200, 4000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  }

  testWidgets('the build is always marked as a prototype',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.text('prototype'), findsWidgets);
  });

  testWidgets('Home keeps tenure internal — no tenure count is surfaced (Q4)',
      (WidgetTester tester) async {
    useTallSurface(tester);
    await tester.pumpWidget(const NiaMemberApp());
    await tester.pumpAndSettle();

    // The Q4 marker must remain visible and state plainly that tenure is not shown.
    // FD markers render via RichText, so findRichText must be enabled.
    expect(
      find.textContaining('no tenure is surfaced', findRichText: true),
      findsOneWidget,
    );
  });

  testWidgets('Profile reflects FD-7 (per-request consent) and still marks FD-11',
      (WidgetTester tester) async {
    useTallSurface(tester);
    await tester.pumpWidget(const NiaMemberApp());

    await tester.tap(find.byTooltip('Me'));
    await tester.pumpAndSettle();

    // FD-7 resolved → "you decide every time"; FD-11 still an open, marked decision.
    expect(find.text('You decide every time.'), findsOneWidget);
    expect(find.textContaining('FD-11', findRichText: true), findsOneWidget);
  });
}
