/// The Floor — the public dignity/settlement guarantees (`GET /v1/floor`,
/// openapi.floor.yaml). Read-only: the app can display the guarantees but never
/// changes them (server-side, Founder-owned). Sample/Api split, same as the others.
library;

import 'package:nia_api/api.dart' show Money, MoneyCurrencyEnum;

import '../../api/nia_transport.dart';

/// The current published Floor — PUBLIC guarantees only (per-Member overrides
/// never appear here). Mirrors the contract's `FloorView`.
class FloorView {
  const FloorView({
    required this.version,
    required this.effectiveAt,
    required this.note,
    required this.author,
    required this.dignityFloor,
    required this.settlementFloor,
    required this.womenDignityFloor,
  });

  factory FloorView.fromJson(Map<String, dynamic> json) => FloorView(
        version: json['version'] as int,
        effectiveAt: json['effective_at'] as String,
        note: json['note'] as String,
        author: json['author'] as String,
        dignityFloor: Money.fromJson(json['dignity_floor'])!,
        settlementFloor: Money.fromJson(json['settlement_floor'])!,
        womenDignityFloor: Money.fromJson(json['women_dignity_floor'])!,
      );

  final int version;
  final String effectiveAt;
  final String note;
  final String author;
  final Money dignityFloor;
  final Money settlementFloor;
  final Money womenDignityFloor;
}

abstract class FloorSource {
  /// The current published Floor. Throws if none is published (404) or on error.
  Future<FloorView> current();
}

/// Offline default: a representative published Floor for the prototype.
class SampleFloorSource implements FloorSource {
  const SampleFloorSource();

  static Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

  @override
  Future<FloorView> current() async => FloorView(
        version: 1,
        effectiveAt: '2026-06-01T00:00:00.000Z',
        note: 'Sample Floor (prototype)',
        author: 'sample',
        dignityFloor: _inr(250000),
        settlementFloor: _inr(1500000),
        womenDignityFloor: _inr(300000),
      );
}

/// Live: `GET /v1/floor` through the transport.
class ApiFloorSource implements FloorSource {
  ApiFloorSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<FloorView> current() async {
    final res = await _transport.send('GET', '/floor');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Floor unavailable');
    return FloorView.fromJson(res.object);
  }
}
