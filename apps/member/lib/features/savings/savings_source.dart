/// Savings (openapi.savings.yaml): read the account (interest accrued to now, net
/// of the disclosed fee), request a withdrawal (instant to Wallet, T+n settle, no
/// penalty), list withdrawals. The interest rate/fee is Founder-owned server-side;
/// the app only displays the disclosed figures.
library;

import 'package:nia_api/api.dart' show Money, MoneyCurrencyEnum;

import '../../api/nia_transport.dart';

/// The Member's savings account with interest accrued to now. Mirrors `AccountView`.
class SavingsAccountView {
  const SavingsAccountView({
    required this.id,
    required this.principal,
    required this.accruedInterest,
    required this.feeCharged,
    required this.netInterest,
    required this.balance,
    required this.locked,
  });

  factory SavingsAccountView.fromJson(Map<String, dynamic> json) => SavingsAccountView(
        id: json['id'] as String,
        principal: Money.fromJson(json['principal'])!,
        accruedInterest: Money.fromJson(json['accrued_interest'])!,
        feeCharged: Money.fromJson(json['fee_charged'])!,
        netInterest: Money.fromJson(json['net_interest'])!,
        balance: Money.fromJson(json['balance'])!,
        locked: json['locked'] as bool,
      );

  final String id;
  final Money principal;
  final Money accruedInterest;
  final Money feeCharged;
  final Money netInterest;
  final Money balance;
  final bool locked;
}

/// A withdrawal and its audit trail. Mirrors the contract's `WithdrawalView`.
class WithdrawalView {
  const WithdrawalView({
    required this.id,
    required this.state,
    required this.amount,
    required this.requestedAt,
    required this.availableAt,
    required this.settleDueAt,
  });

  factory WithdrawalView.fromJson(Map<String, dynamic> json) => WithdrawalView(
        id: json['id'] as String,
        state: json['state'] as String,
        amount: Money.fromJson(json['amount'])!,
        requestedAt: json['requested_at'] as String,
        availableAt: json['available_at'] as String,
        settleDueAt: json['settle_due_at'] as String,
      );

  final String id;
  final String state;
  final Money amount;
  final String requestedAt;
  final String availableAt;
  final String settleDueAt;
}

abstract class SavingsSource {
  Future<SavingsAccountView> account();
  Future<List<WithdrawalView>> withdrawals();
  Future<WithdrawalView> withdraw(Money amount);
}

/// Offline default: a funded, unlocked account for the prototype.
class SampleSavingsSource implements SavingsSource {
  const SampleSavingsSource();

  static Money _inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);

  @override
  Future<SavingsAccountView> account() async => SavingsAccountView(
        id: 'sav-sample',
        principal: _inr(100000),
        accruedInterest: _inr(3000),
        feeCharged: _inr(500),
        netInterest: _inr(2500),
        balance: _inr(102500),
        locked: false,
      );

  @override
  Future<List<WithdrawalView>> withdrawals() async => const [];

  @override
  Future<WithdrawalView> withdraw(Money amount) async => WithdrawalView(
        id: 'w-sample',
        state: 'available',
        amount: amount,
        requestedAt: '2026-06-02T09:00:00.000Z',
        availableAt: '2026-06-02T09:00:00.000Z',
        settleDueAt: '2026-06-04T09:00:00.000Z',
      );
}

/// Live wiring over `GET/POST /v1/savings/...`.
class ApiSavingsSource implements SavingsSource {
  ApiSavingsSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<SavingsAccountView> account() async {
    final res = await _transport.send('GET', '/savings/account');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Savings account unavailable');
    return SavingsAccountView.fromJson(res.object);
  }

  @override
  Future<List<WithdrawalView>> withdrawals() async {
    final res = await _transport.send('GET', '/savings/withdrawals');
    if (!res.ok) throw NiaApiException(res.statusCode, 'Withdrawals unavailable');
    final items = res.object['withdrawals'] as List? ?? const [];
    return [for (final w in items) WithdrawalView.fromJson((w as Map).cast<String, dynamic>())];
  }

  @override
  Future<WithdrawalView> withdraw(Money amount) async {
    final res = await _transport.send('POST', '/savings/withdrawals', body: <String, dynamic>{'amount': amount.toJson()});
    if (!res.ok) throw NiaApiException(res.statusCode, 'Withdrawal refused');
    return WithdrawalView.fromJson(res.object);
  }
}
