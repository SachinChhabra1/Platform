/// How the Member app sources its data: the offline Founder-accepted **sample**
/// (the Product Review Prototype default) or the **live** HTTP backend.
///
/// This is the one composition seam that decides between `Sample*Source` and
/// `Api*Source`. It reads compile-time configuration (`--dart-define`, the
/// idiomatic Flutter mechanism — no runtime dependency, const-constructible so
/// the default `const NiaMemberApp()` stays const):
///   • `NIA_API_BASE_URL` — the backend host, e.g. `http://127.0.0.1:8081`. The
///     `Api*Source` clients append the contract's `/v1` prefix themselves.
///   • `NIA_MEMBER_TOKEN`  — the Member's session bearer (= the membership id
///     under the current PRE-AUTH stub, until phone-first sessions land).
///
/// Empty base URL ⇒ offline: the app keeps serving the sample so the Product
/// Review Prototype runs with no backend. A non-empty base URL ⇒ the app points
/// at the live `/v1` HTTP surfaces through the generated `nia_api` client.
library;

import '../features/membership/membership_source.dart';
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
}
