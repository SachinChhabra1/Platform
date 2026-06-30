//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class WalletApi {
  WalletApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// The Member's money story for one month.
  ///
  /// Returns the Wallet Overview for the requested month, or the current month when `month` is omitted (current is the server's month — server time is the only time the backend uses, Book VIII §1.5). The Member is resolved from the session (default-deny; he sees only his own Wallet, Book VIII §1.4). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  ///
  /// * [String] month:
  ///   The month to project, as 'YYYY-MM'. Omit for the current month. Use `GET /wallet/overview/months` to discover the reachable months. 
  Future<Response> getWalletOverviewWithHttpInfo({ String? acceptLanguage, String? month, }) async {
    // ignore: prefer_const_declarations
    final path = r'/wallet/overview';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (month != null) {
      queryParams.addAll(_queryParams('', 'month', month));
    }

    if (acceptLanguage != null) {
      headerParams[r'Accept-Language'] = parameterToString(acceptLanguage);
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// The Member's money story for one month.
  ///
  /// Returns the Wallet Overview for the requested month, or the current month when `month` is omitted (current is the server's month — server time is the only time the backend uses, Book VIII §1.5). The Member is resolved from the session (default-deny; he sees only his own Wallet, Book VIII §1.4). 
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  ///
  /// * [String] month:
  ///   The month to project, as 'YYYY-MM'. Omit for the current month. Use `GET /wallet/overview/months` to discover the reachable months. 
  Future<MonthlyOverview?> getWalletOverview({ String? acceptLanguage, String? month, }) async {
    final response = await getWalletOverviewWithHttpInfo( acceptLanguage: acceptLanguage, month: month, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MonthlyOverview',) as MonthlyOverview;
    
    }
    return null;
  }

  /// The reachable months in the Member's Wallet.
  ///
  /// The distinct months present in the Member's assembled activity, most recent first — the reachable history the legibility requirement mandates (§3; Article II; Book II §4.8). Each is projectable via `GET /wallet/overview?month=`. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<Response> getWalletOverviewMonthsWithHttpInfo({ String? acceptLanguage, }) async {
    // ignore: prefer_const_declarations
    final path = r'/wallet/overview/months';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (acceptLanguage != null) {
      headerParams[r'Accept-Language'] = parameterToString(acceptLanguage);
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// The reachable months in the Member's Wallet.
  ///
  /// The distinct months present in the Member's assembled activity, most recent first — the reachable history the legibility requirement mandates (§3; Article II; Book II §4.8). Each is projectable via `GET /wallet/overview?month=`. 
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<ReachableMonths?> getWalletOverviewMonths({ String? acceptLanguage, }) async {
    final response = await getWalletOverviewMonthsWithHttpInfo( acceptLanguage: acceptLanguage, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ReachableMonths',) as ReachableMonths;
    
    }
    return null;
  }
}
