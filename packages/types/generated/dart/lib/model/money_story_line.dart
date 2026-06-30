//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MoneyStoryLine {
  /// Returns a new [MoneyStoryLine] instance.
  MoneyStoryLine({
    required this.activityId,
    required this.category,
    required this.direction,
    required this.amount,
  });

  /// Stable id of the underlying activity fact.
  String activityId;

  /// Open category code (data, not policy) — e.g. 'wage', 'rent', 'curry', 'savings', 'remittance', 'informal_debt_repayment'. The Member-facing wording is the client's i18n job. 
  String category;

  /// Whether the money came in or went out. The sign lives here.
  MoneyStoryLineDirectionEnum direction;

  Money amount;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MoneyStoryLine &&
    other.activityId == activityId &&
    other.category == category &&
    other.direction == direction &&
    other.amount == amount;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (activityId.hashCode) +
    (category.hashCode) +
    (direction.hashCode) +
    (amount.hashCode);

  @override
  String toString() => 'MoneyStoryLine[activityId=$activityId, category=$category, direction=$direction, amount=$amount]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'activity_id'] = this.activityId;
      json[r'category'] = this.category;
      json[r'direction'] = this.direction;
      json[r'amount'] = this.amount;
    return json;
  }

  /// Returns a new [MoneyStoryLine] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MoneyStoryLine? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "MoneyStoryLine[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "MoneyStoryLine[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return MoneyStoryLine(
        activityId: mapValueOfType<String>(json, r'activity_id')!,
        category: mapValueOfType<String>(json, r'category')!,
        direction: MoneyStoryLineDirectionEnum.fromJson(json[r'direction'])!,
        amount: Money.fromJson(json[r'amount'])!,
      );
    }
    return null;
  }

  static List<MoneyStoryLine> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MoneyStoryLine>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MoneyStoryLine.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MoneyStoryLine> mapFromJson(dynamic json) {
    final map = <String, MoneyStoryLine>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MoneyStoryLine.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MoneyStoryLine-objects as value to a dart map
  static Map<String, List<MoneyStoryLine>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MoneyStoryLine>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MoneyStoryLine.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'activity_id',
    'category',
    'direction',
    'amount',
  };
}

/// Whether the money came in or went out. The sign lives here.
class MoneyStoryLineDirectionEnum {
  /// Instantiate a new enum with the provided [value].
  const MoneyStoryLineDirectionEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const in_ = MoneyStoryLineDirectionEnum._(r'in');
  static const out_ = MoneyStoryLineDirectionEnum._(r'out');

  /// List of all possible values in this [enum][MoneyStoryLineDirectionEnum].
  static const values = <MoneyStoryLineDirectionEnum>[
    in_,
    out_,
  ];

  static MoneyStoryLineDirectionEnum? fromJson(dynamic value) => MoneyStoryLineDirectionEnumTypeTransformer().decode(value);

  static List<MoneyStoryLineDirectionEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MoneyStoryLineDirectionEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MoneyStoryLineDirectionEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [MoneyStoryLineDirectionEnum] to String,
/// and [decode] dynamic data back to [MoneyStoryLineDirectionEnum].
class MoneyStoryLineDirectionEnumTypeTransformer {
  factory MoneyStoryLineDirectionEnumTypeTransformer() => _instance ??= const MoneyStoryLineDirectionEnumTypeTransformer._();

  const MoneyStoryLineDirectionEnumTypeTransformer._();

  String encode(MoneyStoryLineDirectionEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a MoneyStoryLineDirectionEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  MoneyStoryLineDirectionEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'in': return MoneyStoryLineDirectionEnum.in_;
        case r'out': return MoneyStoryLineDirectionEnum.out_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [MoneyStoryLineDirectionEnumTypeTransformer] instance.
  static MoneyStoryLineDirectionEnumTypeTransformer? _instance;
}


