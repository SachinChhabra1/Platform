/// Backend liveness probe (`GET /v1/health`, openapi.base.yaml). Lets the app
/// confirm the configured backend is reachable before switching a screen to live
/// data. Same Sample/Api split as the other sources.
library;

import '../../api/nia_transport.dart';

abstract class HealthSource {
  /// True when the backend answers healthy; false on any non-ok/unreachable state.
  Future<bool> healthy();
}

/// Offline default: always healthy (the sample app has no backend to probe).
class SampleHealthSource implements HealthSource {
  const SampleHealthSource();

  @override
  Future<bool> healthy() async => true;
}

/// Live: `GET /v1/health` → `{ status: 'ok' }`. Never throws — a probe returns
/// false rather than surfacing a transport error.
class ApiHealthSource implements HealthSource {
  ApiHealthSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<bool> healthy() async {
    try {
      final res = await _transport.send('GET', '/health');
      return res.ok && res.object['status'] == 'ok';
    } catch (_) {
      return false;
    }
  }
}
