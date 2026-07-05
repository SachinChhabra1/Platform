/// The transport seam for the hand-built typed clients (ADR-0007 companion).
///
/// The generated `nia_api` client covers wallet/membership/sessions/ops. The
/// other Member surfaces (floor, remittance, savings, RafiQi, wage, sync, health)
/// are hand-built typed clients over this seam, because a single generated client
/// for ALL contracts hits component-name collisions across the feature specs
/// (`Money`, error responses) that redocly-join can only resolve by renaming the
/// shared types — which would break the existing generated models. Rather than
/// change the backend contracts, these domains speak the same `/v1` HTTP surface
/// through a small, dependency-free transport.
///
/// [NiaTransport] is the seam: production uses [IoNiaTransport] (dart:io, no added
/// package dependency); tests inject a fake that returns canned JSON, so no live
/// backend is needed.
library;

import 'dart:convert';
import 'dart:io';

/// A decoded HTTP response: status + parsed JSON body (`Map`, `List`, or null).
class NiaResponse {
  const NiaResponse(this.statusCode, this.body);

  final int statusCode;
  final dynamic body;

  bool get ok => statusCode >= 200 && statusCode < 300;

  /// The body as a JSON object, or throw if it is not one.
  Map<String, dynamic> get object {
    final b = body;
    if (b is Map) return b.cast<String, dynamic>();
    throw NiaApiException(statusCode, 'Expected a JSON object, got ${b.runtimeType}');
  }
}

/// A non-2xx response (or a transport failure) surfaced as a typed error.
class NiaApiException implements Exception {
  NiaApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  @override
  String toString() => 'NiaApiException($statusCode): $message';
}

/// The transport a hand-built client calls. `path` is relative to the `/v1`
/// prefix (e.g. `/remittances`); `body`, if given, is JSON-encoded.
abstract class NiaTransport {
  Future<NiaResponse> send(String method, String path, {Object? body, Map<String, String>? headers});
}

/// Production transport over `dart:io`'s `HttpClient` — no package dependency
/// added (the offline lockfile cannot grow). Prefixes the contract's `/v1`
/// version path and attaches the Member bearer token when present.
class IoNiaTransport implements NiaTransport {
  IoNiaTransport({required this.baseUrl, this.memberToken = '', HttpClient? client})
      : _client = client ?? HttpClient();

  /// Bare host, e.g. `http://127.0.0.1:8081` (no `/v1`).
  final String baseUrl;

  /// The Member's opaque session bearer token; empty for unauthenticated calls.
  final String memberToken;

  final HttpClient _client;

  @override
  Future<NiaResponse> send(String method, String path, {Object? body, Map<String, String>? headers}) async {
    final uri = Uri.parse('$baseUrl/v1$path');
    final request = await _client.openUrl(method, uri);
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    if (memberToken.isNotEmpty) {
      request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $memberToken');
    }
    headers?.forEach(request.headers.set);
    if (body != null) {
      request.headers.contentType = ContentType.json;
      request.add(utf8.encode(jsonEncode(body)));
    }
    final response = await request.close();
    final text = await response.transform(utf8.decoder).join();
    return NiaResponse(response.statusCode, text.isEmpty ? null : jsonDecode(text));
  }
}
