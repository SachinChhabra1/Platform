/// Where the Wallet Overview comes from (spec 0001 §14 step 4 slice 4).
///
/// The page renders the generated contract model (`MonthlyOverview` from the
/// `nia_api` client, ADR-0007) — the SAME shape the @nia/wallet read model and
/// the HTTP surface speak. Two sources implement the port:
///   • [SampleWalletOverviewSource] — the Founder-accepted scenario, built
///     locally so the Product Review Prototype renders with no backend. This is
///     the default; it is sample data, not a ledger.
///   • [ApiWalletOverviewSource] — the real wiring: it calls the read-only
///     Wallet Overview endpoint via the generated client. Used once a backend is
///     configured; the prototype does not point at one by default.
library;

import 'package:nia_api/api.dart';

/// A read-only source of the Member's current-month Wallet Overview.
abstract class WalletOverviewSource {
  Future<MonthlyOverview> currentOverview();
}

/// The Founder-accepted prototype scenario, as a [MonthlyOverview]. May carried
/// ₹680 forward; June is the wage month. The two figures are distinct by
/// construction (§3): available now ₹3,480 vs stayed this month ₹4,800.
class SampleWalletOverviewSource implements WalletOverviewSource {
  const SampleWalletOverviewSource();

  static Money _inr(int minor) =>
      Money(minor: minor, currency: MoneyCurrencyEnum.INR);

  static MoneyStoryLine _line(
    String id,
    String category,
    MoneyStoryLineDirectionEnum direction,
    int minor,
  ) =>
      MoneyStoryLine(
        activityId: id,
        category: category,
        direction: direction,
        amount: _inr(minor),
      );

  @override
  Future<MonthlyOverview> currentOverview() async {
    return MonthlyOverview(
      month: '2026-06',
      received: _inr(1400000),
      // Distinct figures — NOT the same number (§3).
      stayedThisMonth: _inr(480000),
      availableBalance: _inr(348000),
      story: <MoneyStoryLine>[
        _line('a1', 'wage', MoneyStoryLineDirectionEnum.in_, 1400000),
        _line('a2', 'rent', MoneyStoryLineDirectionEnum.out_, 240000),
        _line('a3', 'curry', MoneyStoryLineDirectionEnum.out_, 180000),
        _line('a4', 'savings', MoneyStoryLineDirectionEnum.out_, 200000),
        _line('a5', 'remittance', MoneyStoryLineDirectionEnum.out_, 500000),
      ],
    );
  }
}

/// The real wiring: fetches the Overview from the read-only Wallet Overview
/// endpoint (openapi.wallet.yaml) through the generated [WalletApi]. The bearer
/// token is the Member's session (a PRE-AUTH STUB on the server: the token is
/// the membership id until phone-first sessions land).
class ApiWalletOverviewSource implements WalletOverviewSource {
  ApiWalletOverviewSource({
    required String baseUrl,
    required String memberToken,
  }) {
    // baseUrl is the bare host (e.g. http://127.0.0.1:8081); the contract serves
    // every route under the `/v1` version prefix, so the client basePath carries
    // it. (The generated client defaults to `/v1`; we override host + keep it.)
    final client = ApiClient(basePath: '$baseUrl/v1');
    client.addDefaultHeader('Authorization', 'Bearer $memberToken');
    _api = WalletApi(client);
  }

  late final WalletApi _api;

  @override
  Future<MonthlyOverview> currentOverview() async {
    final overview = await _api.getWalletOverview();
    if (overview == null) {
      throw StateError('Wallet Overview unavailable');
    }
    return overview;
  }
}
