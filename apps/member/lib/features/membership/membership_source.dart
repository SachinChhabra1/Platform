/// Where the Member's Membership comes from (spec 0001 §3–§5; ADR-0007).
///
/// Same pattern as the Wallet source: the screen renders the generated contract
/// model (`MembershipView` from `nia_api`) — the SAME shape `@nia/membership`'s
/// read surface speaks. Two implementations:
///   • [SampleMembershipSource] — the Founder-accepted prototype Member, built
///     locally so the Product Review Prototype renders with no backend (default).
///   • [ApiMembershipSource] — the real wiring via the generated `MembershipApi`.
///
/// NOTE (Q2, open): the Member's lifecycle `state` is carried in the model but is
/// deliberately NOT surfaced to the Member yet ("not shown until decided"). UI
/// consumers bind the name (known by name, §3), never the state.
library;

import 'package:nia_api/api.dart';

abstract class MembershipSource {
  Future<MembershipView> currentMembership();
}

/// The Founder-accepted prototype Member, as a [MembershipView].
class SampleMembershipSource implements MembershipSource {
  const SampleMembershipSource();

  @override
  Future<MembershipView> currentMembership() async => MembershipView(
        membershipId: 'm-001',
        name: 'Ramesh Kumar',
        state: MembershipState.member,
      );
}

/// The real wiring: fetches the Member's own Membership from `GET /membership/me`
/// through the generated [MembershipApi]. Bearer token = the Member's session
/// (a PRE-AUTH stub on the server until phone-first sessions land).
class ApiMembershipSource implements MembershipSource {
  ApiMembershipSource({required String baseUrl, required String memberToken}) {
    final client = ApiClient(basePath: baseUrl);
    client.addDefaultHeader('Authorization', 'Bearer $memberToken');
    _api = MembershipApi(client);
  }

  late final MembershipApi _api;

  @override
  Future<MembershipView> currentMembership() async {
    final membership = await _api.getMyMembership();
    if (membership == null) {
      throw StateError('Membership unavailable');
    }
    return membership;
  }
}
