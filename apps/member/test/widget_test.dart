import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/app.dart';
import 'package:member/features/wallet/wallet_page.dart';

/// Smoke tests for the Product Review Prototype shell. They prove the shell
/// boots, marks itself as a prototype, and navigates between the four anchors
/// (Book IV §3.2). They assert structure, not product behaviour.
void main() {
  testWidgets('boots to the Home, greeting the Member by name',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.textContaining('Namaste'), findsOneWidget);
  });

  testWidgets('marks itself as a prototype', (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.text('prototype'), findsOneWidget);
  });

  testWidgets('navigates to the Wallet anchor', (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    await tester.tap(find.byIcon(Icons.account_balance_wallet_outlined));
    await tester.pumpAndSettle();

    expect(find.byType(WalletPage), findsOneWidget);
    expect(find.text('This month'), findsOneWidget);
  });
}
