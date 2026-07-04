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
