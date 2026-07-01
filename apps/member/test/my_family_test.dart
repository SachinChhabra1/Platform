import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/family/my_family_page.dart';
import 'package:member/features/shell/member_shell.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';
import 'package:nia_api/api.dart';

/// My Family — a Member-only view (Q3 resolved, spec [A4]). The money that
/// reaches the family is derived live from the Wallet remittance lines; the view
/// is private ([A4]; FE-2 deferred). These assert the view and that the Home
/// life-row opens it.

Money _inr(int m) => Money(minor: m, currency: MoneyCurrencyEnum.INR);

MoneyStoryLine _line(String id, String cat, int m) => MoneyStoryLine(
      activityId: id,
      category: cat,
      direction: MoneyStoryLineDirectionEnum.out_,
      amount: _inr(m),
    );

MonthlyOverview _overview(List<MoneyStoryLine> story) => MonthlyOverview(
      month: '2026-06',
      received: _inr(1400000),
      stayedThisMonth: _inr(480000),
      availableBalance: _inr(348000),
      story: story,
    );

class _Wallet implements WalletOverviewSource {
  _Wallet(this._o);
  final MonthlyOverview _o;
  @override
  Future<MonthlyOverview> currentOverview() async => _o;
}

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1200, 4000);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

void main() {
  testWidgets('renders the family and sums remittances reaching them (live)',
      (WidgetTester tester) async {
    tall(tester);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: MyFamilyPage(
          walletSource: _Wallet(_overview(<MoneyStoryLine>[
            _line('a2', 'rent', 240000),
            _line('a5', 'remittance', 500000),
            _line('a6', 'remittance', 100000),
          ])),
        ),
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('The people your work is for.'), findsOneWidget);
    expect(find.text('Sunita'), findsOneWidget);
    expect(find.textContaining('Wife'), findsOneWidget);
    // 500000 + 100000 paise = ₹6,000; rent is not counted.
    expect(find.textContaining('₹6,000 reached Sunita this month', findRichText: true),
        findsOneWidget);
    expect(find.textContaining('your private view'), findsOneWidget);
  });

  testWidgets('reads calmly when nothing was sent home yet',
      (WidgetTester tester) async {
    tall(tester);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: MyFamilyPage(
          walletSource: _Wallet(_overview(<MoneyStoryLine>[_line('a2', 'rent', 240000)])),
        ),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Nothing sent home yet this month.'), findsOneWidget);
  });

  testWidgets('the Home "Your family" row switches to the Family tab (Q3 retired)',
      (WidgetTester tester) async {
    tall(tester);
    // Through the shell (offline sample) so the row's tab-switch is exercised.
    await tester.pumpWidget(const MaterialApp(home: MemberShell(config: MemberConfig())));
    await tester.pumpAndSettle();

    // The app opens on NiaBook now; the "Your family" row lives on Home.
    await tester.tap(find.byTooltip('Home'));
    await tester.pumpAndSettle();

    // No open-question marker on the family row any more.
    expect(find.text('Q3'), findsNothing);

    await tester.tap(find.text('Your family'));
    await tester.pumpAndSettle();
    expect(find.text('The people your work is for.'), findsOneWidget);
  });
}
