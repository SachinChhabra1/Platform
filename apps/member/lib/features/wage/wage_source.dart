/// Wage settlement (openapi.wage.yaml): the shortfall waterfall allocator. The
/// dignity floor is applied SERVER-SIDE (never sent by the client); the app posts
/// the wage + claims and displays the resulting allocation. Settlement is normally
/// employer/ops-driven — this typed client exists for completeness and for surfaces
/// that display a settlement result.
library;

import 'package:nia_api/api.dart' show Money;

import '../../api/nia_transport.dart';

/// The per-cycle claims deducted in the waterfall (all Money, minor units).
class WageClaims {
  const WageClaims({
    required this.rent,
    required this.curry,
    required this.remittance,
    required this.savings,
    required this.membershipFee,
    required this.advanceRepayment,
  });

  final Money rent;
  final Money curry;
  final Money remittance;
  final Money savings;
  final Money membershipFee;
  final Money advanceRepayment;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'rent': rent.toJson(),
        'curry': curry.toJson(),
        'remittance': remittance.toJson(),
        'savings': savings.toJson(),
        'membership_fee': membershipFee.toJson(),
        'advance_repayment': advanceRepayment.toJson(),
      };
}

/// The settlement result. Mirrors the contract's `WageAllocation` (the fields the
/// app surfaces: take-home and whether the dignity floor was breached).
class WageAllocationView {
  const WageAllocationView({required this.takeHome, required this.floorBreached});

  factory WageAllocationView.fromJson(Map<String, dynamic> json) => WageAllocationView(
        takeHome: Money.fromJson(json['take_home'])!,
        floorBreached: json['floor_breached'] as bool,
      );

  final Money takeHome;
  final bool floorBreached;
}

abstract class WageSource {
  Future<WageAllocationView> settle({required Money wage, required WageClaims claims, required String cause});
}

/// Offline default: a simple full-take-home settlement for the prototype.
class SampleWageSource implements WageSource {
  const SampleWageSource();

  @override
  Future<WageAllocationView> settle({required Money wage, required WageClaims claims, required String cause}) async =>
      WageAllocationView(takeHome: wage, floorBreached: false);
}

/// Live wiring over `POST /v1/wage/settlements`.
class ApiWageSource implements WageSource {
  ApiWageSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<WageAllocationView> settle({required Money wage, required WageClaims claims, required String cause}) async {
    final res = await _transport.send('POST', '/wage/settlements', body: <String, dynamic>{
      'wage': wage.toJson(),
      'claims': claims.toJson(),
      'cause': cause,
    });
    if (!res.ok) throw NiaApiException(res.statusCode, 'Wage settlement failed');
    return WageAllocationView.fromJson(res.object);
  }
}
