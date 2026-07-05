/// RafiQi authorization + reversibility (openapi.rafiqi.yaml): list/grant/revoke
/// standing authorisations (transparency) and reverse an action inside the 24h
/// window. RafiQi *taking* an action is the server-side orchestrator boundary; the
/// app grants consent and reverses.
library;

import 'package:nia_api/api.dart' show Money, MoneyCurrencyEnum;

import '../../api/nia_transport.dart';

/// A standing authorisation. Mirrors the contract's `GrantView`.
class GrantView {
  const GrantView({
    required this.id,
    required this.actionType,
    required this.cap,
    required this.grantedAt,
    required this.expiresAt,
    this.revokedAt,
  });

  factory GrantView.fromJson(Map<String, dynamic> json) => GrantView(
        id: json['id'] as String,
        actionType: json['action_type'] as String,
        cap: Money.fromJson(json['cap'])!,
        grantedAt: json['granted_at'] as String,
        expiresAt: json['expires_at'] as String,
        revokedAt: json['revoked_at'] as String?,
      );

  final String id;
  final String actionType;
  final Money cap;
  final String grantedAt;
  final String expiresAt;
  final String? revokedAt;

  bool get isRevoked => revokedAt != null;
}

abstract class RafiqiSource {
  Future<List<GrantView>> grants();
  Future<GrantView> issueGrant({required String actionType, required Money cap, required int ttlMs});
  Future<GrantView> revokeGrant(String id);
  /// Reverse an action within the 24h window. Returns the action's raw view.
  Future<Map<String, dynamic>> reverseAction(String id);
}

/// Offline default: one active grant for the prototype.
class SampleRafiqiSource implements RafiqiSource {
  const SampleRafiqiSource();

  static Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

  GrantView _sample() => GrantView(
        id: 'g-sample',
        actionType: 'store_swap',
        cap: _inr(50000),
        grantedAt: '2026-06-01T00:00:00.000Z',
        expiresAt: '2026-07-01T00:00:00.000Z',
      );

  @override
  Future<List<GrantView>> grants() async => [_sample()];

  @override
  Future<GrantView> issueGrant({required String actionType, required Money cap, required int ttlMs}) async => GrantView(
        id: 'g-sample-new',
        actionType: actionType,
        cap: cap,
        grantedAt: '2026-06-01T00:00:00.000Z',
        expiresAt: '2026-07-01T00:00:00.000Z',
      );

  @override
  Future<GrantView> revokeGrant(String id) async => GrantView(
        id: id,
        actionType: 'store_swap',
        cap: _inr(50000),
        grantedAt: '2026-06-01T00:00:00.000Z',
        expiresAt: '2026-07-01T00:00:00.000Z',
        revokedAt: '2026-06-15T00:00:00.000Z',
      );

  @override
  Future<Map<String, dynamic>> reverseAction(String id) async => {'id': id, 'state': 'reversed'};
}

/// Live wiring over `GET/POST /v1/rafiqi/...`.
class ApiRafiqiSource implements RafiqiSource {
  ApiRafiqiSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<List<GrantView>> grants() async {
    final res = await _transport.send('GET', '/rafiqi/grants');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Grants unavailable');
    final items = res.object['grants'] as List? ?? const [];
    return [for (final g in items) GrantView.fromJson((g as Map).cast<String, dynamic>())];
  }

  @override
  Future<GrantView> issueGrant({required String actionType, required Money cap, required int ttlMs}) async {
    final res = await _transport.send('POST', '/rafiqi/grants', body: <String, dynamic>{
      'action_type': actionType,
      'cap': cap.toJson(),
      'ttl_ms': ttlMs,
    });
    if (!res.ok) throw NiaApiException(res.statusCode, 'Grant could not be created');
    return GrantView.fromJson(res.object);
  }

  @override
  Future<GrantView> revokeGrant(String id) async {
    final res = await _transport.send('POST', '/rafiqi/grants/$id/revoke');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Grant could not be revoked');
    return GrantView.fromJson(res.object);
  }

  @override
  Future<Map<String, dynamic>> reverseAction(String id) async {
    final res = await _transport.send('POST', '/rafiqi/actions/$id/reverse');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Action could not be reversed');
    return res.object;
  }
}
