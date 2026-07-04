export {
  type Money,
  ZERO_INR,
  paise,
  rupees,
} from './money.js';
export {
  type FlowDirection,
  type WalletActivity,
} from './activity.js';
export {
  type MoneyStoryLine,
  type MonthlyOverview,
  availableMonths,
  overviewForMonth,
  currentMonthOverview,
} from './overview.js';
export {
  type WalletActivitySource,
  InMemoryWalletActivitySource,
} from './source.js';
export {
  type WalletRouteDeps,
  registerWalletOverviewRoutes,
} from './http.js';
// Wage Flow (R3) — the ADR-0012/OD-1 shortfall allocator, co-located in the
// money domain (see wage.ts for the bounded-context note).
export {
  type WageClaims,
  type ShortfallCause,
  type WageInput,
  type WageAllocation,
  DEDUCTION_ORDER,
  allocateWage,
} from './wage.js';
// The dignity-floor seam (server-side; OD-6/ADR-0017 fills the concrete config later).
export { type FloorSource, InMemoryFloorSource } from './floor.js';
// The wage-settlement endpoint (POST /v1/wage/settlements; contract openapi.wage.yaml).
export { type WageRouteDeps, registerWageSettlementRoutes } from './wage_http.js';
// Arrears — the ADR-0012 carry-forward record type + persistence seam (recording
// only; recovery ordering is OD-7).
export {
  type ArrearsCategory,
  type ArrearsRecord,
  type WaiverRecord,
  type ArrearsLedger,
  arrearsFrom,
  waiverFrom,
  InMemoryArrearsLedger,
} from './arrears.js';
// Remittance completion (R4; ADR-0013) — "sent" is not "confirmed"; confirmed =
// recipient-available; 24h SLA → Operator; family ack optional.
export {
  type RemittanceState,
  type RemittanceEvent,
  type Remittance,
  isConfirmed,
  initiateRemittance,
  markSent,
  markRecipientAvailable,
  acknowledgeByFamily,
  markSettled,
  checkSla,
} from './remittance.js';
export {
  type RemittanceStore,
  type OperatorEscalation,
  type OperatorEscalations,
  InMemoryRemittanceStore,
  InMemoryOperatorEscalations,
  escalateIfStalled,
} from './remittance_ledger.js';
export { type RemittanceRouteDeps, registerRemittanceRoutes } from './remittance_http.js';
// RafiQi authorization + reversibility (R5; ADR-0014) — scoped/capped/time-bounded/
// revocable standing consent, 24h reversibility, per-action confirmation fallback.
export {
  type AuthorizationGrant,
  type AuthorizationOutcome,
  type RafiqiAction,
  type RafiqiActionState,
  grantAuthorization,
  revokeGrant,
  isGrantActive,
  authorizeAction,
  takeAction,
  reverseAction,
  checkReversibility,
} from './rafiqi.js';
export {
  type GrantStore,
  type RafiqiActionStore,
  InMemoryGrantStore,
  InMemoryRafiqiActionStore,
} from './rafiqi_ledger.js';
export { type RafiqiRouteDeps, registerRafiqiRoutes } from './rafiqi_http.js';
