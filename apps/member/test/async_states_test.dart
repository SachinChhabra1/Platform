import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/auth/phone_sign_in_page.dart';
import 'package:member/features/auth/session_source.dart';
import 'package:member/features/family/my_family_page.dart';
import 'package:member/features/home/home_page.dart';
import 'package:member/features/pillars/family_page.dart';
import 'package:member/features/remittance/remittance_source.dart';
import 'package:member/features/membership/membership_header.dart';
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

/// Session issuance that is refused by the server (default-deny, an ApiException).
class _DenySession implements SessionSource {
  @override
  Future<String> issue({required String phone, required String deviceId}) async {
    throw ApiException(401, 'unrecognised');
  }
}

/// Session issuance that never reaches the server (network / offline).
class _OfflineSession implements SessionSource {
  @override
  Future<String> issue({required String phone, required String deviceId}) async {
    throw Exception('network down');
  }
}

/// Family reached-home remittance sources — the one contract-backed fact on the
/// Family pillar. Cover the live states without a backend.
class _ThrowingRemittance implements RemittanceSource {
  @override
  Future<List<RemittanceView>> list() async => throw StateError('offline');
  @override
  Future<RemittanceView> get(String id) => throw UnimplementedError();
  @override
  Future<RemittanceView> initiate({required String recipientId, required Money amount, String? settlementId}) =>
      throw UnimplementedError();
}

class _EmptyRemittance implements RemittanceSource {
  @override
  Future<List<RemittanceView>> list() async => const <RemittanceView>[];
  @override
  Future<RemittanceView> get(String id) => throw UnimplementedError();
  @override
  Future<RemittanceView> initiate({required String recipientId, required Money amount, String? settlementId}) =>
      throw UnimplementedError();
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

  testWidgets('Family pillar: reached-home surfaces a calm error + Try again (not a spinner)',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 2600);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: SafeArea(child: FamilyPage(remittance: _ThrowingRemittance())))),
    );
    await tester.pumpAndSettle();

    // People still render; only the money fact degrades, recoverably.
    expect(find.text('Mother'), findsOneWidget);
    expect(find.textContaining("Couldn't check money sent home"), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('Family pillar: reached-home shows the empty state when nothing was sent',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 2600);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: SafeArea(child: FamilyPage(remittance: _EmptyRemittance())))),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('No money sent home yet'), findsOneWidget);
  });

  testWidgets('Profile: a failed standing fetch shows the error state, not a silent gap',
      (WidgetTester tester) async {
    // Tall viewport so the whole (now longer) warm profile lays out for finders.
    tester.view.physicalSize = const Size(390, 2600);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ProfilePage(membershipSource: _ThrowingMembership())),
      ),
    );
    await tester.pumpAndSettle();

    // The identity/standing block surfaces a recoverable error.
    expect(find.textContaining('reach Nia just now'), findsWidgets);
    expect(find.widgetWithText(TextButton, 'Try again'), findsWidgets);
    // The rest of the profile still renders (warm section header is caps).
    expect(find.text('YOUR OPERATOR'), findsOneWidget);
  });

  testWidgets('Membership header: a failed fetch shows the error, not a stuck placeholder',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: MembershipHeader(source: _ThrowingMembership())),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('reach Nia just now'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
  });

  testWidgets('Sign-in: an unrecognised number shows default-deny + the Operator path',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: PhoneSignInPage(
          baseUrl: '',
          defaultPhone: '+910000000000',
          sessionSource: _DenySession(),
        ),
      ),
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Continue'));
    await tester.pumpAndSettle();

    expect(find.textContaining("don't recognise that number"), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Talk to your Operator'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsNothing);
  });

  testWidgets('Sign-in: a network failure shows offline + Try again (distinct from deny)',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: PhoneSignInPage(
          baseUrl: '',
          defaultPhone: '+910000000000',
          sessionSource: _OfflineSession(),
        ),
      ),
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Continue'));
    await tester.pumpAndSettle();

    expect(find.textContaining("couldn't reach Nia"), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Try again'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Talk to your Operator'), findsNothing);
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
