import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/pillars/nia_components.dart';

/// R9 — Motion. Regression cover for the golden-neutral reduce-motion fix: both
/// entrance primitives (NiaReveal, MovementCheck) honor the OS "Reduce Motion"
/// flag by snapping to their final frame instead of playing. Golden-neutral —
/// the settled frame is identical either way, so the five goldens are unchanged;
/// this only asserts the snap happens on the first frame when the flag is set.

Widget _reduceMotion(Widget child) => MaterialApp(
      home: MediaQuery(
        data: const MediaQueryData(disableAnimations: true),
        child: Scaffold(body: Center(child: child)),
      ),
    );

void main() {
  testWidgets('NiaReveal snaps to full opacity on the first frame under Reduce Motion', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      _reduceMotion(const NiaReveal(child: Text('progress'))),
    );
    // No pumpAndSettle: with Reduce Motion the reveal must already be settled.
    final Opacity opacity = tester.widget<Opacity>(
      find.descendant(of: find.byType(NiaReveal), matching: find.byType(Opacity)),
    );
    expect(opacity.opacity, 1.0);
  });

  testWidgets('MovementCheck shows the true (✓) state immediately under Reduce Motion', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_reduceMotion(const MovementCheck()));
    // The check_circle (✓, blue) is fully opaque on the first frame; the
    // hollow ○ has fully crossfaded out.
    final Opacity checkLayer = tester.widget<Opacity>(
      find.ancestor(
        of: find.byIcon(Icons.check_circle),
        matching: find.byType(Opacity),
      ),
    );
    expect(checkLayer.opacity, 1.0);
  });
}
