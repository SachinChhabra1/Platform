//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SessionRequest {
  /// Returns a new [SessionRequest] instance.
  SessionRequest({
    required this.phone,
    required this.deviceId,
  });

  /// The Member's phone, in E.164 (e.g. +919800000001). The proof for this slice; verification strength (one-time code, etc.) is a later slice. 
  String phone;

  /// The device to bind the session to (spec 0002 D2 — client-supplied for the prototype; cryptographic attestation is FE-S1). 
  String deviceId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionRequest &&
    other.phone == phone &&
    other.deviceId == deviceId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (phone.hashCode) +
    (deviceId.hashCode);

  @override
  String toString() => 'SessionRequest[phone=$phone, deviceId=$deviceId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'phone'] = this.phone;
      json[r'device_id'] = this.deviceId;
    return json;
  }

  /// Returns a new [SessionRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "SessionRequest[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "SessionRequest[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return SessionRequest(
        phone: mapValueOfType<String>(json, r'phone')!,
        deviceId: mapValueOfType<String>(json, r'device_id')!,
      );
    }
    return null;
  }

  static List<SessionRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionRequest> mapFromJson(dynamic json) {
    final map = <String, SessionRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionRequest-objects as value to a dart map
  static Map<String, List<SessionRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'phone',
    'device_id',
  };
}

