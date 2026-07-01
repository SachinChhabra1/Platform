//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class SessionsApi {
  SessionsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Issue a session for a Member (phone-first re-proof).
  ///
  /// Issues a fresh, opaque, device-bound session token for the Member who proves the phone. Default-deny: an unrecognised phone is never issued a session (the number alone is necessary, not sufficient — spec 0002 security boundary 2). Issuing revokes the Member's prior device (FD-S3). Mutating, so `Idempotency-Key` is required (Book VIII §1.7): a retry with the same key returns the same token, never a second session. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] idempotencyKey (required):
  ///   Required on every mutating request (Book VIII §1.7, §4.1). A retry with the same key produces the same outcome — no duplicate wage, remittance, or enrolment. 
  ///
  /// * [SessionRequest] sessionRequest (required):
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<Response> issueSessionWithHttpInfo(String idempotencyKey, SessionRequest sessionRequest, { String? acceptLanguage, }) async {
    // ignore: prefer_const_declarations
    final path = r'/sessions';

    // ignore: prefer_final_locals
    Object? postBody = sessionRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    headerParams[r'Idempotency-Key'] = parameterToString(idempotencyKey);
    if (acceptLanguage != null) {
      headerParams[r'Accept-Language'] = parameterToString(acceptLanguage);
    }

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Issue a session for a Member (phone-first re-proof).
  ///
  /// Issues a fresh, opaque, device-bound session token for the Member who proves the phone. Default-deny: an unrecognised phone is never issued a session (the number alone is necessary, not sufficient — spec 0002 security boundary 2). Issuing revokes the Member's prior device (FD-S3). Mutating, so `Idempotency-Key` is required (Book VIII §1.7): a retry with the same key returns the same token, never a second session. 
  ///
  /// Parameters:
  ///
  /// * [String] idempotencyKey (required):
  ///   Required on every mutating request (Book VIII §1.7, §4.1). A retry with the same key produces the same outcome — no duplicate wage, remittance, or enrolment. 
  ///
  /// * [SessionRequest] sessionRequest (required):
  ///
  /// * [String] acceptLanguage:
  ///   The Member's language (Book VIII §4.1 — every endpoint returns content in the Member's language). BCP-47 tag; falls back to English. 
  Future<SessionIssued?> issueSession(String idempotencyKey, SessionRequest sessionRequest, { String? acceptLanguage, }) async {
    final response = await issueSessionWithHttpInfo(idempotencyKey, sessionRequest,  acceptLanguage: acceptLanguage, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'SessionIssued',) as SessionIssued;
    
    }
    return null;
  }
}
