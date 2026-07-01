import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/home/home_page.dart';
import 'package:member/features/profile/profile_page.dart';

/// Guard tests for the Product Review Build's standing invariants — the things
/// the Engineering Quality Certification asserts every iteration: tenure stays
/// internal (Q4), and the Founder-Decision markers hold (FD-7 resolved, FD-11
/// still open). Home and Profile are not in the live nav any more (NiaBook is the
/// product), so these pump the pages directly to keep the invariants enforceable.
///
/// A tall surface realises lazily-built ListView content without scrolling.
void main() {
  void useTallSurface(WidgetTester tester) {
    tester.view.physicalSize = const Size(1200, 4000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  }

  testWidgets('Home keeps tenure internal — no tenure count is surfaced (Q4)',
      (WidgetTester tester) async {
    useTallSurface(tester);
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: HomePage())),
    );
    await tester.pumpAndSettle();

    // The Q4 marker must remain visible and state plainly that tenure is not
    // shown. FD markers render via RichText, so findRichText must be enabled.
    expect(
      find.textContaining('no tenure is surfaced', findRichText: true),
      findsOneWidget,
    );
  });

  testWidgets('Profile reflects FD-7 (per-request consent) and still marks FD-11',
      (WidgetTester tester) async {
    useTallSurface(tester);
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: ProfilePage())),
    );
    await tester.pumpAndSettle();

    // FD-7 resolved → "you decide every time"; FD-11 still an open, marked decision.
    expect(find.text('You decide every time.'), findsOneWidget);
    expect(find.textContaining('FD-11', findRichText: true), findsOneWidget);
  });
}
