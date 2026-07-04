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
  type ArrearsLedger,
  arrearsFrom,
  InMemoryArrearsLedger,
} from './arrears.js';
