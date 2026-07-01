//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

/// What a session may reach (spec 0002 FD-S8): a full `member` session, or a `pre_membership` (Prospective, onboarding-status only) session. 
class SessionScope {
  /// Instantiate a new enum with the provided [value].
  const SessionScope._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const preMembership = SessionScope._(r'pre_membership');
  static const member = SessionScope._(r'member');

  /// List of all possible values in this [enum][SessionScope].
  static const values = <SessionScope>[
    preMembership,
    member,
  ];

  static SessionScope? fromJson(dynamic value) => SessionScopeTypeTransformer().decode(value);

  static List<SessionScope> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionScope>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionScope.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [SessionScope] to String,
/// and [decode] dynamic data back to [SessionScope].
class SessionScopeTypeTransformer {
  factory SessionScopeTypeTransformer() => _instance ??= const SessionScopeTypeTransformer._();

  const SessionScopeTypeTransformer._();

  String encode(SessionScope data) => data.value;

  /// Decodes a [dynamic value][data] to a SessionScope.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  SessionScope? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'pre_membership': return SessionScope.preMembership;
        case r'member': return SessionScope.member;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [SessionScopeTypeTransformer] instance.
  static SessionScopeTypeTransformer? _instance;
}

