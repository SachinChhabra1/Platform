import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/wallet/wallet_page.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';
import 'package:nia_api/api.dart';

/// Slice-4 guard tests: the Wallet renders the TWO DISTINCT figures spec §3
/// requires, and the generated client parses the HTTP surface's wire format.

class _FakeSource implements WalletOverviewSource {
  _FakeSource(this._overview);
  final MonthlyOverview _overview;
  @override
  Future<MonthlyOverview> currentOverview() async => _overview;
}

Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

Future<void> _pumpWallet(WidgetTester tester, WalletOverviewSource source) async {
  await tester.pumpWidget(
    MaterialApp(home: Scaffold(body: WalletPage(source: source))),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('shows "stayed" and "available now" as two DISTINCT figures (§3)',
      (WidgetTester tester) async {
    final overview = MonthlyOverview(
      month: '2026-06',
      received: _inr(1400000),
      stayedThisMonth: _inr(480000), // ₹4,800
      availableBalance: _inr(348000), // ₹3,480
      story: <MoneyStoryLine>[
        MoneyStoryLine(
            activityId: 'a1',
            category: 'wage',
            direction: MoneyStoryLineDirectionEnum.in_,
            amount: _inr(1400000)),
        MoneyStoryLine(
            activityId: 'a2',
            category: 'rent',
            direction: MoneyStoryLineDirectionEnum.out_,
            amount: _inr(240000)),
      ],
    );

    await _pumpWallet(tester, _FakeSource(overview));

    // Both figures are present, and they are NOT the same number.
    expect(find.textContaining('₹4,800 stayed with you'), findsOneWidget);
    expect(find.textContaining('₹3,480 is yours to use now'), findsOneWidget);
    // The wage line drives the lead sentence, not a duplicate story line.
    expect(find.textContaining('₹14,000 salary arrived'), findsOneWidget);
  });

  testWidgets('a lean month renders plainly, with no shame (§3, §5.4)',
      (WidgetTester tester) async {
    // 9000 wage, 2400 rent, 3000 debt repayment, 1200 deduction → 2400 stayed.
    final lean = MonthlyOverview(
      month: '2026-07',
      received: _inr(900000),
      stayedThisMonth: _inr(240000),
      availableBalance: _inr(240000),
      story: <MoneyStoryLine>[
        MoneyStoryLine(
            activityId: 'b1',
            category: 'wage',
            direction: MoneyStoryLineDirectionEnum.in_,
            amount: _inr(900000)),
        MoneyStoryLine(
            activityId: 'b3',
            category: 'informal_debt_repayment',
            direction: MoneyStoryLineDirectionEnum.out_,
            amount: _inr(300000)),
      ],
    );

    await _pumpWallet(tester, _FakeSource(lean));

    // The debt line is an ordinary story line, no alarm. Story lines render via
    // RichText, so findRichText must be enabled.
    expect(
      find.textContaining('repaid what you had borrowed', findRichText: true),
      findsOneWidget,
    );
    expect(find.textContaining('₹2,400 stayed with you'), findsOneWidget);
  });

  test('generated client parses the HTTP surface wire format into two figures',
      () {
    // The exact snake_case JSON the @nia/wallet HTTP surface returns.
    const wire = '''
{"month":"2026-06","received":{"minor":1400000,"currency":"INR"},
"stayed_this_month":{"minor":480000,"currency":"INR"},
"available_balance":{"minor":348000,"currency":"INR"},
"story":[{"activity_id":"a1","category":"wage","direction":"in",
"amount":{"minor":1400000,"currency":"INR"}}]}''';

    final overview =
        MonthlyOverview.fromJson(jsonDecode(wire) as Map<String, dynamic>)!;

    expect(overview.stayedThisMonth.minor, 480000);
    expect(overview.availableBalance.minor, 348000);
    // The whole point of §3: the two figures are distinct.
    expect(overview.stayedThisMonth.minor,
        isNot(equals(overview.availableBalance.minor)));
    expect(overview.story.single.activityId, 'a1');
  });
}
