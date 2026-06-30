/// The API version prefix every Nia service mounts under.
///
/// The OpenAPI contract declares `servers: [{ url: /v1 }]` (openapi.base.yaml) and
/// the generated clients default their basePath to `/v1`. This constant is the
/// single source of truth on the server side so the running services and the
/// contract agree: every route — the health probe and every feature surface — is
/// served under this prefix. Bump it here (and in the contract) to version the API.

export const API_PREFIX = '/v1';
