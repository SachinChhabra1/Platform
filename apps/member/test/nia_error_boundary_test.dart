import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/widgets/nia_error_boundary.dart';

/// R9.5 — crash recovery. A widget that throws during build must never show a raw
/// Flutter error box to a Member; the boundary swaps in a calm, reassuring screen.

void main() {
  testWidgets('NiaErrorScreen renders a calm, reassuring message (no raw crash)',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NiaErrorScreen());

    expect(find.textContaining('Something interrupted'), findsOneWidget);
    expect(find.textContaining('your money and your record are safe'), findsOneWidget);
  });

  testWidgets('the crash-boundary builder produces the calm screen for any error',
      (WidgetTester tester) async {
    final Widget produced =
        niaErrorWidgetBuilder(FlutterErrorDetails(exception: Exception('boom')));
    expect(produced, isA<NiaErrorScreen>());

    await tester.pumpWidget(produced);
    expect(find.textContaining('Nia is still here'), findsOneWidget);
  });
}
