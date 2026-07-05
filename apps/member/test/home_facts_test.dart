import 'package:flutter_test/flutter_test.dart';
import 'package:nia_api/api.dart'
    show Money, MoneyCurrencyEnum, MoneyStoryLine, MoneyStoryLineDirectionEnum, MonthlyOverview;

import 'package:member/features/niabook/home_facts.dart';
import 'package:member/features/niabook/home_insights.dart';

Money inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);
MoneyStoryLine line(String category, MoneyStoryLineDirectionEnum dir, int minor) =>
    MoneyStoryLine(activityId: category, category: category, direction: dir, amount: inr(minor));

void main() {
  group('HomeFacts.fromOverview — the live waterfall truth', () {
    test('maps earned/living/family/saved/kept from the Wallet Overview', () {
      final overview = MonthlyOverview(
        month: '2026-07',
        received: inr(1600000),
        stayedThisMonth: inr(500000), // kept
        availableBalance: inr(500000),
        story: <MoneyStoryLine>[
          line('wage', MoneyStoryLineDirectionEnum.in_, 1600000),
          line('rent', MoneyStoryLineDirectionEnum.out_, 300000),
          line('curry', MoneyStoryLineDirectionEnum.out_, 200000),
          line('remittance', MoneyStoryLineDirectionEnum.out_, 500000),
          line('savings', MoneyStoryLineDirectionEnum.out_, 100000),
        ],
      );

      final facts = HomeFacts.fromOverview(
        overview,
        memberName: 'Asha Devi',
        memberSite: 'Site B',
        savingsBalancePaise: 900000,
        floorProtectedPaise: 200000,
        keptHistory: HomeFacts.sample.keptHistory,
        contributions: HomeFacts.sample.contributions,
        identity: HomeFacts.sample.identity,
      );

      expect(facts.live, isTrue);
      expect(facts.monthLabel, 'July 2026'); // '2026-07' → long month
      expect(facts.memberName, 'Asha Devi');
      expect(facts.earnedPaise, 1600000);
      expect(facts.livingPaise, 500000); // rent + curry
      expect(facts.familyPaise, 500000); // remittance
      expect(facts.savedPaise, 100000); // savings
      expect(facts.keptPaise, 500000); // stayedThisMonth
      expect(facts.savingsBalancePaise, 900000);
      expect(facts.floorProtectedPaise, 200000);
      // Momentum's last point tracks this month's real kept.
      expect(facts.keptHistory.last.keptPaise, 500000);
    });
  });

  group('deriveHomeInsights — the derived story (no invented numbers)', () {
    test('stronger-by is this month minus last; next is a momentum projection', () {
      final insights = deriveHomeInsights(HomeFacts.sample);
      // sample kept history: 3950 → 4100 → 4500 → 4800 (paise ×100)
      expect(insights.strongerByPaise, 30000); // 4800 − 4500 = ₹300
      expect(insights.builtThisMonthPaise, 480000); // this month's kept
      // avg recent gain = (15000+40000+30000)/3 = 28333 → next = 480000 + 28333
      expect(insights.estimatedNextPaise, 508333);
      expect(insights.improved, isTrue);
    });

    test('a flat month does not claim improvement', () {
      const flat = HomeFacts(
        monthLabel: 'July 2026',
        memberName: 'A',
        memberSite: 'S',
        earnedPaise: 1000000,
        livingPaise: 400000,
        familyPaise: 300000,
        savedPaise: 0,
        keptPaise: 300000,
        savingsBalancePaise: 0,
        floorProtectedPaise: 0,
        walletAvailablePaise: 300000,
        keptHistory: <MonthKept>[MonthKept('Jun', 300000), MonthKept('Jul', 300000)],
        contributions: <PillarContribution>[],
        identity: <IdentityStat>[],
      );
      final insights = deriveHomeInsights(flat);
      expect(insights.strongerByPaise, 0);
      expect(insights.improved, isFalse);
      expect(insights.estimatedNextPaise, 300000); // no positive gain to project
    });
  });
}
