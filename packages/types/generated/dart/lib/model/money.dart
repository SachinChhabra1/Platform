//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class Money {
  /// Returns a new [Money] instance.
  Money({
    required this.minor,
    required this.currency,
  });

  /// The amount in minor units (paise). May be negative where the figure it carries can be negative (e.g. a lean month's `stayed_this_month`). 
  int minor;

  /// ISO 4217 currency. Nia is INR-only in this slice.
  MoneyCurrencyEnum currency;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Money &&
    other.minor == minor &&
    other.currency == currency;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (minor.hashCode) +
    (currency.hashCode);

  @override
  String toString() => 'Money[minor=$minor, currency=$currency]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'minor'] = this.minor;
      json[r'currency'] = this.currency;
    return json;
  }

  /// Returns a new [Money] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Money? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "Money[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "Money[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return Money(
        minor: mapValueOfType<int>(json, r'minor')!,
        currency: MoneyCurrencyEnum.fromJson(json[r'currency'])!,
      );
    }
    return null;
  }

  static List<Money> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Money>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Money.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Money> mapFromJson(dynamic json) {
    final map = <String, Money>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Money.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Money-objects as value to a dart map
  static Map<String, List<Money>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Money>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Money.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'minor',
    'currency',
  };
}

/// ISO 4217 currency. Nia is INR-only in this slice.
class MoneyCurrencyEnum {
  /// Instantiate a new enum with the provided [value].
  const MoneyCurrencyEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const INR = MoneyCurrencyEnum._(r'INR');

  /// List of all possible values in this [enum][MoneyCurrencyEnum].
  static const values = <MoneyCurrencyEnum>[
    INR,
  ];

  static MoneyCurrencyEnum? fromJson(dynamic value) => MoneyCurrencyEnumTypeTransformer().decode(value);

  static List<MoneyCurrencyEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MoneyCurrencyEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MoneyCurrencyEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MoneyCurrencyEnum] to String,
/// and [decode] dynamic data back to [MoneyCurrencyEnum].
class MoneyCurrencyEnumTypeTransformer {
  factory MoneyCurrencyEnumTypeTransformer() => _instance ??= const MoneyCurrencyEnumTypeTransformer._();

  const MoneyCurrencyEnumTypeTransformer._();

  String encode(MoneyCurrencyEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a MoneyCurrencyEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MoneyCurrencyEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'INR': return MoneyCurrencyEnum.INR;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [MoneyCurrencyEnumTypeTransformer] instance.
  static MoneyCurrencyEnumTypeTransformer? _instance;
}


