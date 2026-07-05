/// Offline write reconciliation (openapi.sync.yaml): push offline writes and get a
/// per-write outcome. Money writes are server-authoritative-with-reconciliation (a
/// diverged one goes to the Operator, never silently overwritten); intent is
/// last-write-wins; append-only merges (ADR-0015). The app pushes; the server rules.
library;

import '../../api/nia_transport.dart';

/// One offline write to reconcile. `payload` is arbitrary JSON for the record.
class OfflineWrite {
  const OfflineWrite({
    required this.id,
    required this.recordClass,
    required this.updatedAt,
    this.payload = const {},
    this.baseUpdatedAt,
  });

  /// One of: `money`, `intent`, `append_only`.
  final String recordClass;
  final String id;
  final String updatedAt;
  final Map<String, dynamic> payload;
  final String? baseUpdatedAt;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'record': <String, dynamic>{
          'id': id,
          'record_class': recordClass,
          'updated_at': updatedAt,
          'payload': payload,
        },
        'base_updated_at': ?baseUpdatedAt,
      };
}

/// The server's decision for one write: `applied` / `kept_server` / `merged` /
/// `conflict_operator`.
class SyncOutcome {
  const SyncOutcome({required this.id, required this.outcome});

  factory SyncOutcome.fromJson(Map<String, dynamic> json) =>
      SyncOutcome(id: json['id'] as String, outcome: json['outcome'] as String);

  final String id;
  final String outcome;
}

abstract class SyncSource {
  Future<List<SyncOutcome>> push(List<OfflineWrite> writes);
}

/// Offline default: echoes every write as `applied` (nothing to reconcile against).
class SampleSyncSource implements SyncSource {
  const SampleSyncSource();

  @override
  Future<List<SyncOutcome>> push(List<OfflineWrite> writes) async =>
      [for (final w in writes) SyncOutcome(id: w.id, outcome: 'applied')];
}

/// Live wiring over `POST /v1/sync`.
class ApiSyncSource implements SyncSource {
  ApiSyncSource(this._transport);

  final NiaTransport _transport;

  @override
  Future<List<SyncOutcome>> push(List<OfflineWrite> writes) async {
    final res = await _transport.send('POST', '/sync', body: <String, dynamic>{
      'writes': [for (final w in writes) w.toJson()],
    });
    if (!res.ok) throw NiaApiException(res.statusCode, 'Sync failed');
    final results = res.object['results'] as List? ?? const [];
    return [for (final r in results) SyncOutcome.fromJson((r as Map).cast<String, dynamic>())];
  }
}
