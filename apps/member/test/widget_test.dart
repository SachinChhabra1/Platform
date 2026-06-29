import 'package:flutter_test/flutter_test.dart';
import 'package:member/app.dart';
import 'package:member/features/wallet/wallet_page.dart';

void main() {
  testWidgets('app boots to the Home placeholder', (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    expect(find.text('Home — placeholder'), findsOneWidget);
  });

  testWidgets('routing shell navigates Home -> Wallet',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NiaMemberApp());

    await tester.tap(find.text('Go to Wallet'));
    await tester.pumpAndSettle();

    expect(find.byType(WalletPage), findsOneWidget);
    expect(find.text('Wallet — placeholder'), findsOneWidget);
  });
}
