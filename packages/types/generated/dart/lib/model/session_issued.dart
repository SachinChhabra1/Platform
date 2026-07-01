//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionIssued {
  /// Returns a new [SessionIssued] instance.
  SessionIssued({
    required this.token,
    required this.scope,
    required this.serverTime,
  });

  /// The opaque bearer session token (never the membership id).
  String token;

  SessionScope scope;

  /// Server time of issuance (Book VIII §1.5).
  DateTime serverTime;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionIssued &&
    other.token == token &&
    other.scope == scope &&
    other.serverTime == serverTime;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (token.hashCode) +
    (scope.hashCode) +
    (serverTime.hashCode);

  @override
  String toString() => 'SessionIssued[token=$token, scope=$scope, serverTime=$serverTime]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'token'] = this.token;
      json[r'scope'] = this.scope;
      json[r'server_time'] = this.serverTime.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [SessionIssued] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionIssued? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "SessionIssued[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "SessionIssued[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return SessionIssued(
        token: mapValueOfType<String>(json, r'token')!,
        scope: SessionScope.fromJson(json[r'scope'])!,
        serverTime: mapDateTime(json, r'server_time', r'')!,
      );
    }
    return null;
  }

  static List<SessionIssued> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionIssued>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionIssued.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionIssued> mapFromJson(dynamic json) {
    final map = <String, SessionIssued>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionIssued.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionIssued-objects as value to a dart map
  static Map<String, List<SessionIssued>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionIssued>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionIssued.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'token',
    'scope',
    'server_time',
  };
}

