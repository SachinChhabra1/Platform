import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/home/home_page.dart';
import 'package:member/features/membership/membership_source.dart';
import 'package:member/features/profile/profile_page.dart';
import 'package:member/features/recovery/recovery_page.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';
import 'package:nia_api/api.dart';

/// Developer Preview screens: the Home reads live, Profile gains the phone /
/// recovery / sign-out actions, and the Recovery screen previews the future
/// human-mediated flow. These assert the Preview *experience* — the data path is
/// proven separately (app_modes_test, the @nia/preview backend tests).

Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

MonthlyOverview _overview() => MonthlyOverview(
      month: '2026-06',
      received: _inr(1400000),
      stayedThisMonth: _inr(480000),
      availableBalance: _inr(348000),
      story: <MoneyStoryLine>[
        MoneyStoryLine(
            activityId: 'a2',
            category: 'rent',
            direction: MoneyStoryLineDirectionEnum.out_,
            amount: _inr(240000)),
      ],
    );

MembershipView _member(MembershipState state) =>
    MembershipView(membershipId: 'm-001', name: 'Ramesh Kumar', state: state);

class _Wallet implements WalletOverviewSource {
  _Wallet(this._o);
  final MonthlyOverview _o;
  @override
  Future<MonthlyOverview> currentOverview() async => _o;
}

class _Member implements MembershipSource {
  _Member(this._m);
  final MembershipView _m;
  @override
  Future<MembershipView> currentMembership() async => _m;
}

void tall(WidgetTester tester) {
  tester.view.physicalSize = const Size(1200, 4000);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

void main() {
  group('Home — live', () {
    testWidgets('greets by name, shows the standing (Q2), and the two §3 figures',
        (WidgetTester tester) async {
      tall(tester);
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: HomePage(
            walletSource: _Wallet(_overview()),
            membershipSource: _Member(_member(MembershipState.member)),
          ),
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Namaste, Ramesh'), findsOneWidget);
      expect(find.text('An active Member of Nia'), findsOneWidget);
      expect(find.text('₹3,480'), findsOneWidget);
      expect(find.textContaining('₹4,800 stayed with you this month'), findsOneWidget);
      // Q4 tenure stays internal even with the standing now shown.
      expect(find.textContaining('no tenure is surfaced', findRichText: true),
          findsOneWidget);
    });

    testWidgets('a Paused Member reads as paused, with the Operator offered',
        (WidgetTester tester) async {
      tall(tester);
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: HomePage(
            walletSource: _Wallet(_overview()),
            membershipSource: _Member(_member(MembershipState.paused)),
          ),
        ),
      ));
      await tester.pumpAndSettle();
      expect(find.text('Your membership is paused'), findsOneWidget);
      expect(find.text('Talk to your Operator'), findsOneWidget);
    });
  });

  group('Profile — Preview actions', () {
    testWidgets('shows standing, phone, the Nia-phone recovery link, and sign out',
        (WidgetTester tester) async {
      tall(tester);
      await tester.pumpWidget(MaterialApp(
        home: ProfilePage(
          membershipSource: _Member(_member(MembershipState.member)),
          previewMode: true,
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('An active Member of Nia'), findsOneWidget);
      expect(find.text('Phone'), findsOneWidget);
      expect(find.text('This phone is your Nia phone'), findsOneWidget);
      expect(find.text('Sign out of this phone'), findsOneWidget);
      // Preview hides the remaining prototype FD scaffolding.
      expect(find.textContaining('FD-11', findRichText: true), findsNothing);
    });
  });

  group('Recovery — mock of the human-mediated flow (spec 0002)', () {
    testWidgets('previews "your Nia phone" and the in-person Studio recovery',
        (WidgetTester tester) async {
      tall(tester);
      await tester.pumpWidget(const MaterialApp(home: RecoveryPage()));
      await tester.pumpAndSettle();

      expect(find.text('This phone is your Nia phone.'), findsOneWidget);
      expect(find.text('Visit your Nia Studio.'), findsOneWidget);
      expect(find.textContaining('safely move your account'), findsOneWidget);
    });
  });
}
