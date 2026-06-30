import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/membership/membership_header.dart';
import 'package:member/features/membership/membership_source.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';
import 'package:member/features/wallet/wallet_page.dart';
import 'package:nia_api/api.dart';

/// End-to-end proof for the live-app-configuration slice: the SAME screens
/// render correctly in BOTH modes the slice introduces.
///
///  • Offline — `Sample*Source` (the Product Review Prototype default): the
///    screens render the Founder-accepted scenario with no backend.
///  • Live — `Api*Source` selected by [MemberConfig]: the screens fetch from a
///    real HTTP server over the generated `nia_api` client, hitting the
///    contract's `/v1` paths with the Member's bearer, and render the same story.
///
/// The live tests make REAL loopback HTTP calls. `flutter_test` installs an
/// `HttpOverrides` that fails all network requests (to catch accidental network
/// access), so each live test runs inside `HttpOverrides.runZoned` with a real
/// `HttpClient` restored.

const Map<String, dynamic> _walletWire = <String, dynamic>{
  'month': '2026-06',
  'received': <String, dynamic>{'minor': 1400000, 'currency': 'INR'},
  // The two DISTINCT §3 figures: ₹4,800 stayed ≠ ₹3,480 available.
  'stayed_this_month': <String, dynamic>{'minor': 480000, 'currency': 'INR'},
  'available_balance': <String, dynamic>{'minor': 348000, 'currency': 'INR'},
  'story': <dynamic>[
    <String, dynamic>{
      'activity_id': 'a1',
      'category': 'wage',
      'direction': 'in',
      'amount': <String, dynamic>{'minor': 1400000, 'currency': 'INR'},
    },
    <String, dynamic>{
      'activity_id': 'a2',
      'category': 'rent',
      'direction': 'out',
      'amount': <String, dynamic>{'minor': 240000, 'currency': 'INR'},
    },
  ],
};

const Map<String, dynamic> _membershipWire = <String, dynamic>{
  'membership_id': 'm-001',
  'name': 'Ramesh Kumar',
  'state': 'member',
};

/// `flutter_test` installs an `HttpOverrides` that fails all network requests.
/// This restores the default (real) `HttpClient` for a scope — the base
/// `HttpOverrides.createHttpClient` builds a real client, so subclassing without
/// overriding it (vs. calling `HttpClient()`, which would recurse on the active
/// override and stack-overflow) is the way to re-enable real loopback HTTP.
class _RealHttpOverrides extends HttpOverrides {}

Future<T> _withRealHttp<T>(Future<T> Function() body) =>
    HttpOverrides.runWithHttpOverrides<Future<T>>(body, _RealHttpOverrides());

/// Hands an already-fetched value to a screen. The live fetch happens in
/// `tester.runAsync` (real I/O cannot complete under the widget test's fake
/// clock); the screen then renders the very object that arrived over HTTP.
class _ResolvedWallet implements WalletOverviewSource {
  _ResolvedWallet(this._overview);
  final MonthlyOverview _overview;
  @override
  Future<MonthlyOverview> currentOverview() async => _overview;
}

class _ResolvedMembership implements MembershipSource {
  _ResolvedMembership(this._membership);
  final MembershipView _membership;
  @override
  Future<MembershipView> currentMembership() async => _membership;
}

void main() {
  group('Offline mode — Sample*Source (the prototype default)', () {
    testWidgets('Wallet renders the two DISTINCT §3 figures from the sample',
        (WidgetTester tester) async {
      await tester
          .pumpWidget(const MaterialApp(home: Scaffold(body: WalletPage())));
      await tester.pumpAndSettle();

      expect(find.textContaining('₹4,800 stayed with you'), findsOneWidget);
      expect(find.textContaining('₹3,480 is yours to use now'), findsOneWidget);
    });

    testWidgets('Membership header renders the sample Member by name',
        (WidgetTester tester) async {
      await tester.pumpWidget(
          const MaterialApp(home: Scaffold(body: MembershipHeader())));
      await tester.pumpAndSettle();

      expect(find.text('Ramesh Kumar'), findsOneWidget);
      expect(find.text('A Member of Nia'), findsOneWidget);
    });
  });

  group('Live mode — Api*Source over HTTP through the generated client', () {
    late HttpServer server;
    late MemberConfig config;
    final List<String> requestedPaths = <String>[];
    final List<String?> authHeaders = <String?>[];

    setUp(() async {
      requestedPaths.clear();
      authHeaders.clear();
      server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      server.listen((HttpRequest request) async {
        requestedPaths.add(request.uri.path);
        authHeaders.add(request.headers.value(HttpHeaders.authorizationHeader));
        request.response.headers.contentType = ContentType.json;
        switch (request.uri.path) {
          case '/v1/wallet/overview':
            request.response.write(jsonEncode(_walletWire));
          case '/v1/membership/me':
            request.response.write(jsonEncode(_membershipWire));
          default:
            request.response.statusCode = HttpStatus.notFound;
        }
        await request.response.close();
      });
      config = MemberConfig(
        apiBaseUrl: 'http://127.0.0.1:${server.port}',
        memberToken: 'm-001',
      );
    });

    tearDown(() async {
      await server.close(force: true);
    });

    testWidgets('Wallet fetches GET /v1/wallet/overview and renders the figures',
        (WidgetTester tester) async {
      expect(config.usesLiveBackend, isTrue);

      // Live fetch over real HTTP through the generated client (real I/O ⇒
      // tester.runAsync; real HttpClient ⇒ _withRealHttp).
      late final MonthlyOverview fetched;
      await tester.runAsync(() => _withRealHttp(() async {
            fetched = await config.walletSource().currentOverview();
          }));

      // It went to the contract's /v1 path with the Member's session, and the
      // generated client parsed the two DISTINCT §3 figures off the wire.
      expect(requestedPaths, contains('/v1/wallet/overview'));
      expect(authHeaders, contains('Bearer m-001'));
      expect(fetched.stayedThisMonth.minor, 480000);
      expect(fetched.availableBalance.minor, 348000);

      // The screen renders the very object that arrived over HTTP.
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: WalletPage(source: _ResolvedWallet(fetched))),
      ));
      await tester.pumpAndSettle();
      expect(find.textContaining('₹4,800 stayed with you'), findsOneWidget);
      expect(find.textContaining('₹3,480 is yours to use now'), findsOneWidget);
    });

    testWidgets('Membership fetches GET /v1/membership/me and renders the name',
        (WidgetTester tester) async {
      late final MembershipView fetched;
      await tester.runAsync(() => _withRealHttp(() async {
            fetched = await config.membershipSource().currentMembership();
          }));

      expect(requestedPaths, contains('/v1/membership/me'));
      expect(authHeaders, contains('Bearer m-001'));
      expect(fetched.name, 'Ramesh Kumar');
      expect(fetched.state, MembershipState.member);

      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: MembershipHeader(source: _ResolvedMembership(fetched))),
      ));
      await tester.pumpAndSettle();
      expect(find.text('Ramesh Kumar'), findsOneWidget);
      expect(find.text('A Member of Nia'), findsOneWidget);
    });
  });
}
