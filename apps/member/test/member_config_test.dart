import 'package:flutter_test/flutter_test.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/membership/membership_source.dart';
import 'package:member/features/wallet/wallet_overview_source.dart';

/// Guard tests for the live-vs-offline composition seam (slice: live app
/// configuration). The default keeps the Product Review Prototype offline on the
/// Founder-accepted sample; a configured backend URL selects the live HTTP
/// `Api*Source`. Source construction is inert (no network until a fetch), so
/// these stay pure and fast.
void main() {
  test('no backend configured → offline sample sources (the prototype default)',
      () {
    const config = MemberConfig();
    expect(config.usesLiveBackend, isFalse);
    expect(config.walletSource(), isA<SampleWalletOverviewSource>());
    expect(config.membershipSource(), isA<SampleMembershipSource>());
  });

  test('a configured backend URL → live HTTP Api sources', () {
    const config = MemberConfig(
      apiBaseUrl: 'http://127.0.0.1:8081',
      memberToken: 'm-001',
    );
    expect(config.usesLiveBackend, isTrue);
    expect(config.walletSource(), isA<ApiWalletOverviewSource>());
    expect(config.membershipSource(), isA<ApiMembershipSource>());
  });

  test('an empty backend URL is treated as offline, even with a token', () {
    const config = MemberConfig(memberToken: 'm-001');
    expect(config.usesLiveBackend, isFalse);
    expect(config.walletSource(), isA<SampleWalletOverviewSource>());
  });
}
