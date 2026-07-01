/// Obtaining a session — the front of the chain (spec 0002, `POST /v1/sessions`).
///
/// Phone-first re-proof: give the Member's phone + this device, get back the
/// opaque session token the rest of the app presents. Same pattern as the other
/// sources — it speaks the generated `nia_api` contract client (ADR-0007).
library;

import 'dart:math';

import 'package:nia_api/api.dart';

abstract class SessionSource {
  /// Issues a session for [phone] bound to [deviceId]; returns the opaque token.
  /// Throws if the number is not recognised (default-deny) or issuance fails.
  Future<String> issue({required String phone, required String deviceId});
}

/// The real wiring: calls `POST /v1/sessions` through the generated [SessionsApi].
/// Unauthenticated (you don't have a session yet) — the proof is the phone.
class ApiSessionSource implements SessionSource {
  ApiSessionSource({required String baseUrl})
      : _api = SessionsApi(ApiClient(basePath: '$baseUrl/v1'));

  final SessionsApi _api;

  @override
  Future<String> issue({required String phone, required String deviceId}) async {
    // Idempotency-Key (Book VIII §1.7): a fresh key per attempt; a retry of the
    // SAME attempt would reuse it and get the same token back.
    final issued = await _api.issueSession(
      _uuidV4(),
      SessionRequest(phone: phone, deviceId: deviceId),
    );
    if (issued == null) {
      throw StateError('No session was issued.');
    }
    return issued.token;
  }
}

/// A minimal UUID v4 (the prototype has no uuid package). Random is fine here —
/// this is a client-supplied idempotency key, not a security token.
String _uuidV4() {
  final rnd = Random();
  final bytes = List<int>.generate(16, (_) => rnd.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}'
      '-${hex.substring(16, 20)}-${hex.substring(20)}';
}
