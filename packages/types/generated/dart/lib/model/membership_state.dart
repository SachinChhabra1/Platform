//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

/// Canonical lifecycle state (spec §5). A closed four-state machine; the Member-facing label (Prospective / Member / Paused / Closed) is presentation the client owns (FD-3). 
class MembershipState {
  /// Instantiate a new enum with the provided [value].
  const MembershipState._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const prospective = MembershipState._(r'prospective');
  static const member = MembershipState._(r'member');
  static const paused = MembershipState._(r'paused');
  static const closed = MembershipState._(r'closed');

  /// List of all possible values in this [enum][MembershipState].
  static const values = <MembershipState>[
    prospective,
    member,
    paused,
    closed,
  ];

  static MembershipState? fromJson(dynamic value) => MembershipStateTypeTransformer().decode(value);

  static List<MembershipState> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MembershipState>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MembershipState.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MembershipState] to String,
/// and [decode] dynamic data back to [MembershipState].
class MembershipStateTypeTransformer {
  factory MembershipStateTypeTransformer() => _instance ??= const MembershipStateTypeTransformer._();

  const MembershipStateTypeTransformer._();

  String encode(MembershipState data) => data.value;

  /// Decodes a [dynamic value][data] to a MembershipState.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MembershipState? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'prospective': return MembershipState.prospective;
        case r'member': return MembershipState.member;
        case r'paused': return MembershipState.paused;
        case r'closed': return MembershipState.closed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [MembershipStateTypeTransformer] instance.
  static MembershipStateTypeTransformer? _instance;
}

