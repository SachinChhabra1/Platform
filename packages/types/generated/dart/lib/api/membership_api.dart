//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class MembershipApi {
  MembershipApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// The signed-in Member's identity and lifecycle state.
  ///
  /// Returns the Member's own Membership — resolved from the session, never a path id, so a Member can only ever see his own (default-deny, Book VIII §1.4). Carries no tenure (FD-3, Q4). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<Response> getMyMembershipWithHttpInfo({ String? acceptLanguage, }) async {
    // ignore: prefer_const_declarations
    final path = r'/membership/me';

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

  /// The signed-in Member's identity and lifecycle state.
  ///
  /// Returns the Member's own Membership — resolved from the session, never a path id, so a Member can only ever see his own (default-deny, Book VIII §1.4). Carries no tenure (FD-3, Q4). 
  ///
  /// Parameters:
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<MembershipView?> getMyMembership({ String? acceptLanguage, }) async {
    final response = await getMyMembershipWithHttpInfo( acceptLanguage: acceptLanguage, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MembershipView',) as MembershipView;
    
    }
    return null;
  }
}
