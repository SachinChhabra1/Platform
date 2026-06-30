//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MonthlyOverview {
  /// Returns a new [MonthlyOverview] instance.
  MonthlyOverview({
    required this.month,
    required this.received,
    required this.stayedThisMonth,
    required this.availableBalance,
    this.story = const [],
  });

  /// The month this overview covers, 'YYYY-MM'.
  String month;

  Money received;

  /// What stayed his this month — the net change in his total holdings (savings he kept + surplus), distinct from what he can spend now. May be low or negative in a lean month; represented plainly, never as a failure (§3; §5.4). 
  Money stayedThisMonth;

  /// What he can use now — the running spendable balance through the end of this month (carryover included). Deliberately distinct from `stayed_this_month`. 
  Money availableBalance;

  /// The month's activities as neutral story lines, in order.
  List<MoneyStoryLine> story;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MonthlyOverview &&
    other.month == month &&
    other.received == received &&
    other.stayedThisMonth == stayedThisMonth &&
    other.availableBalance == availableBalance &&
    _deepEquality.equals(other.story, story);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (month.hashCode) +
    (received.hashCode) +
    (stayedThisMonth.hashCode) +
    (availableBalance.hashCode) +
    (story.hashCode);

  @override
  String toString() => 'MonthlyOverview[month=$month, received=$received, stayedThisMonth=$stayedThisMonth, availableBalance=$availableBalance, story=$story]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'month'] = this.month;
      json[r'received'] = this.received;
      json[r'stayed_this_month'] = this.stayedThisMonth;
      json[r'available_balance'] = this.availableBalance;
      json[r'story'] = this.story;
    return json;
  }

  /// Returns a new [MonthlyOverview] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MonthlyOverview? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "MonthlyOverview[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "MonthlyOverview[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return MonthlyOverview(
        month: mapValueOfType<String>(json, r'month')!,
        received: Money.fromJson(json[r'received'])!,
        stayedThisMonth: Money.fromJson(json[r'stayed_this_month'])!,
        availableBalance: Money.fromJson(json[r'available_balance'])!,
        story: MoneyStoryLine.listFromJson(json[r'story']),
      );
    }
    return null;
  }

  static List<MonthlyOverview> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MonthlyOverview>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MonthlyOverview.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MonthlyOverview> mapFromJson(dynamic json) {
    final map = <String, MonthlyOverview>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MonthlyOverview.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MonthlyOverview-objects as value to a dart map
  static Map<String, List<MonthlyOverview>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MonthlyOverview>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MonthlyOverview.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'month',
    'received',
    'stayed_this_month',
    'available_balance',
    'story',
  };
}

