// Tests for the hand-built typed API-client layer: each ApiXSource parses the
// contract's JSON via a FAKE transport (no live backend), and MemberConfig
// switches Sample↔Api by apiBaseUrl.
import 'package:flutter_test/flutter_test.dart';
import 'package:nia_api/api.dart' show Money, MoneyCurrencyEnum;

import 'package:member/api/nia_transport.dart';
import 'package:member/config/member_config.dart';
import 'package:member/features/floor/floor_source.dart';
import 'package:member/features/health/health_source.dart';
import 'package:member/features/rafiqi/rafiqi_source.dart';
import 'package:member/features/remittance/remittance_source.dart';
import 'package:member/features/savings/savings_source.dart';
import 'package:member/features/sync/sync_source.dart';
import 'package:member/features/wage/wage_source.dart';

/// A fake transport: records calls and replays a scripted response — no sockets.
class FakeTransport implements NiaTransport {
  FakeTransport(this._handler);

  final NiaResponse Function(String method, String path, Object? body) _handler;
  final List<({String method, String path, Object? body})> calls = [];

  @override
  Future<NiaResponse> send(String method, String path, {Object? body, Map<String, String>? headers}) async {
    calls.add((method: method, path: path, body: body));
    return _handler(method, path, body);
  }
}

Money inr(int minor) => Money(minor: minor, currency: MoneyCurrencyEnum.INR);
Map<String, dynamic> money(int minor) => {'minor': minor, 'currency': 'INR'};

void main() {
  group('ApiHealthSource', () {
    test('healthy() is true on {status: ok}', () async {
      final s = ApiHealthSource(FakeTransport((_, _, _) => NiaResponse(200, {'status': 'ok'})));
      expect(await s.healthy(), isTrue);
    });
    test('healthy() is false on non-ok / error', () async {
      final s = ApiHealthSource(FakeTransport((_, _, _) => const NiaResponse(503, null)));
      expect(await s.healthy(), isFalse);
    });
  });

  group('ApiFloorSource', () {
    test('parses the public Floor guarantees', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'version': 3,
            'effective_at': '2026-06-01T00:00:00.000Z',
            'note': 'n',
            'author': 'founder',
            'dignity_floor': money(250000),
            'settlement_floor': money(1500000),
            'women_dignity_floor': money(300000),
          }));
      final floor = await ApiFloorSource(t).current();
      expect(floor.version, 3);
      expect(floor.dignityFloor.minor, 250000);
      expect(floor.womenDignityFloor.minor, 300000);
      expect(t.calls.single.path, '/floor');
    });

    test('throws on 404 (unconfigured Floor)', () async {
      final s = ApiFloorSource(FakeTransport((_, _, _) => const NiaResponse(404, null)));
      expect(() => s.current(), throwsA(isA<NiaApiException>()));
    });
  });

  group('ApiRemittanceSource', () {
    test('lists and reads state/history', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'remittances': [
              {
                'id': 'rem-1',
                'state': 'confirmed_available',
                'amount': money(500000),
                'recipient_id': 'fam',
                'initiated_at': 't0',
                'escalate_after': 't1',
                'family_acknowledged': true,
                'history': [
                  {'type': 'initiated', 'at': 't0'},
                  {'type': 'sent', 'at': 't1'},
                ],
              }
            ],
          }));
      final list = await ApiRemittanceSource(t).list();
      expect(list.single.id, 'rem-1');
      expect(list.single.isConfirmed, isTrue);
      expect(list.single.history.length, 2);
    });

    test('initiate posts recipient + amount and parses the created remittance', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(201, {
            'id': 'rem-new',
            'state': 'initiated',
            'amount': money(500000),
            'recipient_id': 'fam',
            'initiated_at': 't0',
            'escalate_after': 't1',
            'family_acknowledged': false,
            'history': [
              {'type': 'initiated', 'at': 't0'}
            ],
          }));
      final r = await ApiRemittanceSource(t).initiate(recipientId: 'fam', amount: inr(500000));
      expect(r.state, 'initiated');
      final body = t.calls.single.body as Map<String, dynamic>;
      expect(body['recipient_id'], 'fam');
      expect((body['amount'] as Map)['minor'], 500000);
      expect(body.containsKey('settlement_id'), isFalse); // null-aware entry dropped
    });
  });

  group('ApiSavingsSource', () {
    test('reads the account with disclosed interest/fee', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'id': 'sav-1',
            'principal': money(100000),
            'accrued_interest': money(3000),
            'fee_charged': money(500),
            'net_interest': money(2500),
            'balance': money(102500),
            'locked': false,
            'opened_at': 't0',
            'last_accrued_at': 't1',
          }));
      final a = await ApiSavingsSource(t).account();
      expect(a.balance.minor, 102500);
      expect(a.netInterest.minor, 2500);
      expect(a.locked, isFalse);
    });

    test('withdraw posts the amount and parses the available withdrawal', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(201, {
            'id': 'w-1',
            'account_id': 'sav-1',
            'amount': money(40000),
            'state': 'available',
            'requested_at': 't0',
            'available_at': 't0',
            'settle_due_at': 't2',
            'history': [
              {'type': 'requested', 'at': 't0'},
              {'type': 'available', 'at': 't0'},
            ],
          }));
      final w = await ApiSavingsSource(t).withdraw(inr(40000));
      expect(w.state, 'available');
      expect((t.calls.single.body as Map)['amount'], isA<Map>());
    });
  });

  group('ApiRafiqiSource', () {
    test('lists grants', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'grants': [
              {
                'id': 'g-1',
                'action_type': 'store_swap',
                'cap': money(50000),
                'granted_at': 't0',
                'expires_at': 't1',
              }
            ],
          }));
      final grants = await ApiRafiqiSource(t).grants();
      expect(grants.single.actionType, 'store_swap');
      expect(grants.single.isRevoked, isFalse);
    });

    test('issueGrant posts action_type/cap/ttl', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(201, {
            'id': 'g-2',
            'action_type': 'store_swap',
            'cap': money(50000),
            'granted_at': 't0',
            'expires_at': 't1',
          }));
      await ApiRafiqiSource(t).issueGrant(actionType: 'store_swap', cap: inr(50000), ttlMs: 1000);
      final body = t.calls.single.body as Map<String, dynamic>;
      expect(body['action_type'], 'store_swap');
      expect(body['ttl_ms'], 1000);
    });
  });

  group('ApiWageSource', () {
    test('settle posts wage/claims/cause and parses take-home', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'take_home': money(100000),
            'floor_breached': false,
          }));
      final zero = inr(0);
      final result = await ApiWageSource(t).settle(
        wage: inr(100000),
        claims: WageClaims(rent: zero, curry: zero, remittance: zero, savings: zero, membershipFee: zero, advanceRepayment: zero),
        cause: 'none',
      );
      expect(result.takeHome.minor, 100000);
      expect(result.floorBreached, isFalse);
      final body = t.calls.single.body as Map<String, dynamic>;
      expect((body['claims'] as Map).containsKey('membership_fee'), isTrue);
    });
  });

  group('ApiSyncSource', () {
    test('push sends writes and parses per-write outcomes', () async {
      final t = FakeTransport((_, _, _) => NiaResponse(200, {
            'results': [
              {'id': 'r1', 'outcome': 'applied'},
              {'id': 'r2', 'outcome': 'conflict_operator'},
            ],
          }));
      final outcomes = await ApiSyncSource(t).push([
        const OfflineWrite(id: 'r1', recordClass: 'money', updatedAt: 't1'),
        const OfflineWrite(id: 'r2', recordClass: 'money', updatedAt: 't2', baseUpdatedAt: 't0'),
      ]);
      expect(outcomes.map((o) => o.outcome).toList(), ['applied', 'conflict_operator']);
      final writes = (t.calls.single.body as Map)['writes'] as List;
      // The second write carries base_updated_at; the first does not (null-aware).
      expect((writes[0] as Map).containsKey('base_updated_at'), isFalse);
      expect((writes[1] as Map)['base_updated_at'], 't0');
    });
  });

  group('MemberConfig switch (Sample ↔ Api by apiBaseUrl)', () {
    test('empty base URL → offline sample sources', () {
      const c = MemberConfig();
      expect(c.usesLiveBackend, isFalse);
      expect(c.floorSource(), isA<SampleFloorSource>());
      expect(c.remittanceSource(), isA<SampleRemittanceSource>());
      expect(c.savingsSource(), isA<SampleSavingsSource>());
      expect(c.rafiqiSource(), isA<SampleRafiqiSource>());
      expect(c.wageSource(), isA<SampleWageSource>());
      expect(c.syncSource(), isA<SampleSyncSource>());
      expect(c.healthSource(), isA<SampleHealthSource>());
    });

    test('a configured base URL → live Api sources', () {
      const c = MemberConfig(apiBaseUrl: 'http://127.0.0.1:8081', memberToken: 'tok');
      expect(c.usesLiveBackend, isTrue);
      expect(c.floorSource(), isA<ApiFloorSource>());
      expect(c.remittanceSource(), isA<ApiRemittanceSource>());
      expect(c.savingsSource(), isA<ApiSavingsSource>());
      expect(c.rafiqiSource(), isA<ApiRafiqiSource>());
      expect(c.wageSource(), isA<ApiWageSource>());
      expect(c.syncSource(), isA<ApiSyncSource>());
      expect(c.healthSource(), isA<ApiHealthSource>());
    });
  });
}
