//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ErrorRetry {
  /// Returns a new [ErrorRetry] instance.
  ErrorRetry({
    this.retryable,
    this.afterSeconds,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? retryable;

  /// Minimum value: 0
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  int? afterSeconds;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ErrorRetry &&
    other.retryable == retryable &&
    other.afterSeconds == afterSeconds;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (retryable == null ? 0 : retryable!.hashCode) +
    (afterSeconds == null ? 0 : afterSeconds!.hashCode);

  @override
  String toString() => 'ErrorRetry[retryable=$retryable, afterSeconds=$afterSeconds]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.retryable != null) {
      json[r'retryable'] = this.retryable;
    } else {
      json[r'retryable'] = null;
    }
    if (this.afterSeconds != null) {
      json[r'after_seconds'] = this.afterSeconds;
    } else {
      json[r'after_seconds'] = null;
    }
    return json;
  }

  /// Returns a new [ErrorRetry] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ErrorRetry? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "ErrorRetry[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "ErrorRetry[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return ErrorRetry(
        retryable: mapValueOfType<bool>(json, r'retryable'),
        afterSeconds: mapValueOfType<int>(json, r'after_seconds'),
      );
    }
    return null;
  }

  static List<ErrorRetry> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ErrorRetry>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ErrorRetry.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ErrorRetry> mapFromJson(dynamic json) {
    final map = <String, ErrorRetry>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ErrorRetry.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ErrorRetry-objects as value to a dart map
  static Map<String, List<ErrorRetry>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ErrorRetry>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ErrorRetry.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}

