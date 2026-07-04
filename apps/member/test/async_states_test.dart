import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/family/my_family_page.dart';
import 'package:member/features/home/home_page.dart';
import 'package:member/features/membership/membership_source.dart';
import 'package:member/features/profile/profile_page.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';
import 'package:member/features/wallet/wallet_page.dart';
import 'package:nia_api/api.dart';

/// R9.1 — live-surface error / offline states.
///
/// The live surfaces fetch the Wallet Overview over HTTP. Before R9.1 their
/// `FutureBuilder`s handled loading but not failure, so a dropped network /
/// airplane mode / 4xx-5xx / timeout left the UI spinning **forever**. These
/// tests prove the calm, recoverable error state now replaces the endless
/// spinner — and that Retry re-fetches and recovers.

/// Always fails — stands in for airplane mode / a dead backend.
class _ThrowingWallet implements WalletOverviewSource {
  @override
  Future<MonthlyOverview> currentOverview() async {
    throw StateError('offline');
  }
}

/// Fails once, then succeeds — proves Retry actually re-issues the fetch.
class _FlakyWallet implements WalletOverviewSource {
  int calls = 0;
  @override
  Future<MonthlyOverview> currentOverview() async {
    calls++;
    if (calls == 1) throw StateError('offline');
    return const SampleWalletOverviewSource().currentOverview();
  }
}

/// Always fails — for the membership-backed surfaces.
class _ThrowingMembership implements MembershipSource {
  @override
  Future<MembershipView> currentMembership() async {
    throw StateError('offline');
  }
}

void main() {
  testWidgets('Wallet: a failed fetch shows a calm error + Try again, not a spinner',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: WalletPage(source: _ThrowingWallet()))),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('reach Nia just now'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    // The defect being fixed: no endless spinner once the fetch has failed.
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('Home: the balance shows an error state (greeting still renders)',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: HomePage(
            walletSource: _ThrowingWallet(),
            membershipSource: const SampleMembershipSource(),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Greeting degrades gracefully; the balance surfaces a recoverable error.
    expect(find.textContaining('Namaste'), findsOneWidget);
    expect(find.textContaining('reach Nia just now'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('My Family: a failed fetch shows the error state, not a spinner',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: MyFamilyPage(walletSource: _ThrowingWallet()))),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('reach Nia just now'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('Profile: a failed standing fetch shows the error state, not a silent gap',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ProfilePage(membershipSource: _ThrowingMembership())),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('reach Nia just now'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    // The rest of the profile still renders.
    expect(find.text('Your Operator'), findsOneWidget);
  });

  testWidgets('Retry recovers: tapping Try again re-fetches and renders the data',
      (WidgetTester tester) async {
    final flaky = _FlakyWallet();
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: WalletPage(source: flaky))),
    );
    await tester.pumpAndSettle();

    // First fetch failed → error state.
    expect(find.textContaining('reach Nia just now'), findsOneWidget);

    await tester.tap(find.widgetWithText(TextButton, 'Try again'));
    await tester.pumpAndSettle();

    // The second fetch succeeded → the money story renders; error is gone.
    expect(flaky.calls, 2);
    expect(find.textContaining('₹4,800 stayed with you'), findsOneWidget);
    expect(find.textContaining('reach Nia just now'), findsNothing);
  });
}
