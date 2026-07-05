/// How the Member app sources its data: the offline Founder-accepted **sample**
/// (the Product Review Prototype default) or the **live** HTTP backend.
///
/// This is the one composition seam that decides between `Sample*Source` and
/// `Api*Source`. It reads compile-time configuration (`--dart-define`, the
/// idiomatic Flutter mechanism — no runtime dependency, const-constructible so
/// the default `const NiaMemberApp()` stays const):
///   • `NIA_API_BASE_URL` — the backend host, e.g. `http://127.0.0.1:8081`. The
///     `Api*Source` clients append the contract's `/v1` prefix themselves.
///   • `NIA_MEMBER_TOKEN`  — the Member's opaque session token, validated
///     server-side (e.g. the seeded demo session `sess-ramesh-001`). Phone-first
///     issuance (Book VIII §1.3) is not built yet, so tokens are seeded — but the
///     server no longer treats the bearer as a membership id.
///
/// Empty base URL ⇒ offline: the app keeps serving the sample so the Product
/// Review Prototype runs with no backend. A non-empty base URL ⇒ the app points
/// at the live `/v1` HTTP surfaces through the generated `nia_api` client.
library;

import '../api/nia_transport.dart';
import '../features/floor/floor_source.dart';
import '../features/health/health_source.dart';
import '../features/membership/membership_source.dart';
import '../features/niabook/home_source.dart';
import '../features/rafiqi/rafiqi_source.dart';
import '../features/remittance/remittance_source.dart';
import '../features/savings/savings_source.dart';
import '../features/sync/sync_source.dart';
import '../features/wage/wage_source.dart';
import '../features/wallet/wallet_overview_source.dart';

class MemberConfig {
  const MemberConfig({this.apiBaseUrl = '', this.memberToken = ''});

  /// Reads the compile-time `--dart-define` values. const so it can be the
  /// default for `const NiaMemberApp()` / `const MemberShell()`.
  const MemberConfig.fromEnvironment()
      : apiBaseUrl = const String.fromEnvironment('NIA_API_BASE_URL'),
        memberToken = const String.fromEnvironment('NIA_MEMBER_TOKEN');

  /// Backend host (no `/v1`); empty when no backend is configured.
  final String apiBaseUrl;

  /// The Member's session bearer token presented to the backend.
  final String memberToken;

  /// True once a backend host is configured — the app then uses the live HTTP
  /// sources; otherwise it stays on the offline sample.
  bool get usesLiveBackend => apiBaseUrl.isNotEmpty;

  /// The Wallet Overview source for this configuration: live over HTTP when a
  /// backend is configured, the Founder-accepted sample otherwise.
  WalletOverviewSource walletSource() => usesLiveBackend
      ? ApiWalletOverviewSource(baseUrl: apiBaseUrl, memberToken: memberToken)
      : const SampleWalletOverviewSource();

  /// The Membership source for this configuration, by the same rule.
  MembershipSource membershipSource() => usesLiveBackend
      ? ApiMembershipSource(baseUrl: apiBaseUrl, memberToken: memberToken)
      : const SampleMembershipSource();

  // --- Hand-built typed clients (floor / remittance / savings / RafiQi / wage /
  // sync / health) over the shared transport seam. Same switch rule: live over
  // HTTP when a backend is configured, the offline sample otherwise. -----------

  /// A fresh transport for the live backend (bare host + `/v1` + bearer token).
  NiaTransport _transport() => IoNiaTransport(baseUrl: apiBaseUrl, memberToken: memberToken);

  FloorSource floorSource() =>
      usesLiveBackend ? ApiFloorSource(_transport()) : const SampleFloorSource();

  RemittanceSource remittanceSource() =>
      usesLiveBackend ? ApiRemittanceSource(_transport()) : const SampleRemittanceSource();

  SavingsSource savingsSource() =>
      usesLiveBackend ? ApiSavingsSource(_transport()) : const SampleSavingsSource();

  RafiqiSource rafiqiSource() =>
      usesLiveBackend ? ApiRafiqiSource(_transport()) : const SampleRafiqiSource();

  WageSource wageSource() =>
      usesLiveBackend ? ApiWageSource(_transport()) : const SampleWageSource();

  SyncSource syncSource() =>
      usesLiveBackend ? ApiSyncSource(_transport()) : const SampleSyncSource();

  HealthSource healthSource() =>
      usesLiveBackend ? ApiHealthSource(_transport()) : const SampleHealthSource();

  /// The NiaBook home's TRUTH source. Live assembles the facts from the wallet
  /// overview + savings + floor + membership; offline serves the sample. The
  /// home's derived story is computed client-side from whichever facts this yields.
  HomeFactsSource homeSource() => usesLiveBackend
      ? ApiHomeFactsSource(
          wallet: walletSource(),
          savings: savingsSource(),
          floor: floorSource(),
          membership: membershipSource(),
        )
      : const SampleHomeFactsSource();
}
