/// Remittance completion (openapi.remittance.yaml): initiate a remittance, list
/// the Member's remittances, read one by id. "Sent" is never "confirmed" —
/// confirmation is rail-driven server-side (ADR-0013); the app only displays state.
library;

import 'package:nia_api/api.dart' show Money, MoneyCurrencyEnum;

import '../../api/nia_transport.dart';

/// One remittance and its audit trail. Mirrors the contract's `RemittanceView`.
class RemittanceView {
  const RemittanceView({
    required this.id,
    required this.state,
    required this.amount,
    required this.recipientId,
    required this.initiatedAt,
    required this.escalateAfter,
    required this.familyAcknowledged,
    required this.history,
    this.settlementId,
  });

  factory RemittanceView.fromJson(Map<String, dynamic> json) => RemittanceView(
        id: json['id'] as String,
        state: json['state'] as String,
        amount: Money.fromJson(json['amount'])!,
        recipientId: json['recipient_id'] as String,
        initiatedAt: json['initiated_at'] as String,
        escalateAfter: json['escalate_after'] as String,
        familyAcknowledged: json['family_acknowledged'] as bool? ?? false,
        settlementId: json['settlement_id'] as String?,
        history: <RemittanceEvent>[
          for (final e in (json['history'] as List? ?? const []))
            RemittanceEvent.fromJson((e as Map).cast<String, dynamic>()),
        ],
      );

  final String id;
  final String state;
  final Money amount;
  final String recipientId;
  final String initiatedAt;
  final String escalateAfter;
  final bool familyAcknowledged;
  final String? settlementId;
  final List<RemittanceEvent> history;

  /// "Reached home" — confirmed available to the recipient (never merely "sent").
  bool get isConfirmed => state == 'confirmed_available' || state == 'settled';
}

class RemittanceEvent {
  const RemittanceEvent({required this.type, required this.at});

  factory RemittanceEvent.fromJson(Map<String, dynamic> json) =>
      RemittanceEvent(type: json['type'] as String, at: json['at'] as String);

  final String type;
  final String at;
}

abstract class RemittanceSource {
  Future<List<RemittanceView>> list();
  Future<RemittanceView> get(String id);
  Future<RemittanceView> initiate({required String recipientId, required Money amount, String? settlementId});
}

/// Offline default: one confirmed remittance for the prototype.
class SampleRemittanceSource implements RemittanceSource {
  const SampleRemittanceSource();

  static Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

  RemittanceView _sample() => RemittanceView(
        id: 'rem-sample-1',
        state: 'confirmed_available',
        amount: _inr(500000),
        recipientId: 'fam-anita',
        initiatedAt: '2026-06-02T09:00:00.000Z',
        escalateAfter: '2026-06-03T09:00:00.000Z',
        familyAcknowledged: true,
        settlementId: 's-sample',
        history: const [
          RemittanceEvent(type: 'initiated', at: '2026-06-02T09:00:00.000Z'),
          RemittanceEvent(type: 'sent', at: '2026-06-02T10:00:00.000Z'),
          RemittanceEvent(type: 'recipient_available', at: '2026-06-02T11:00:00.000Z'),
        ],
      );

  @override
  Future<List<RemittanceView>> list() async => [_sample()];

  @override
  Future<RemittanceView> get(String id) async => _sample();

  @override
  Future<RemittanceView> initiate({required String recipientId, required Money amount, String? settlementId}) async =>
      RemittanceView(
        id: 'rem-sample-new',
        state: 'initiated',
        amount: amount,
        recipientId: recipientId,
        initiatedAt: '2026-06-02T09:00:00.000Z',
        escalateAfter: '2026-06-03T09:00:00.000Z',
        familyAcknowledged: false,
        settlementId: settlementId,
        history: const [RemittanceEvent(type: 'initiated', at: '2026-06-02T09:00:00.000Z')],
      );
}

/// Live wiring over `GET/POST /v1/remittances`.
class ApiRemittanceSource implements RemittanceSource {
  ApiRemittanceSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<List<RemittanceView>> list() async {
    final res = await _transport.send('GET', '/remittances');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Remittances unavailable');
    final items = res.object['remittances'] as List? ?? const [];
    return [for (final r in items) RemittanceView.fromJson((r as Map).cast<String, dynamic>())];
  }

  @override
  Future<RemittanceView> get(String id) async {
    final res = await _transport.send('GET', '/remittances/$id');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Remittance $id unavailable');
    return RemittanceView.fromJson(res.object);
  }

  @override
  Future<RemittanceView> initiate({required String recipientId, required Money amount, String? settlementId}) async {
    final res = await _transport.send('POST', '/remittances', body: <String, dynamic>{
      'recipient_id': recipientId,
      'amount': amount.toJson(),
      'settlement_id': ?settlementId,
    });
    if (!res.ok) throw NiaApiException(res.statusCode, 'Remittance could not be initiated');
    return RemittanceView.fromJson(res.object);
  }
}
