import 'package:flutter_test/flutter_test.dart';
import 'package:member/app.dart';
import 'package:member/features/niabook/niabook_page.dart';

/// Smoke tests for the Product Review Prototype shell. They prove the shell
/// boots on NiaBook (the first screen), marks itself as a prototype, and
/// navigates between the four anchors (Book IV §3.2). They assert structure,
/// not product behaviour.
void main() {
  testWidgets('boots to NiaBook, opening on the verdict',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.byType(NiaBookPage), findsOneWidget);
    expect(find.text('June was worth it.'), findsOneWidget);
  });

  testWidgets('marks itself as a prototype', (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.text('prototype'), findsOneWidget);
  });

  testWidgets('navigates to the Home anchor', (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    await tester.tap(find.byTooltip('Home'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Namaste'), findsOneWidget);
  });
}
