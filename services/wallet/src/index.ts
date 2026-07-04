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
// The dignity-floor seam (server-side; the concrete config below fills it — R8).
export { type FloorSource, InMemoryFloorSource } from './floor.js';
// The Floor (R8; ADR-0017/OD-6) — the versioned, Founder-owned, audited `the_floor`
// config behind the FloorSource seam. Mechanism only; no value invented in code.
export {
  type FloorValues,
  type FloorVersion,
  type PublishInput,
  createInitialFloor,
  reviseFloor,
  resolveDignityFloor,
} from './the_floor.js';
export {
  type FloorRegistry,
  InMemoryFloorRegistry,
  RegistryFloorSource,
} from './the_floor_registry.js';
export { type FloorRouteDeps, registerFloorRoutes } from './floor_http.js';
// The wage-settlement endpoint (POST /v1/wage/settlements; contract openapi.wage.yaml).
export { type WageRouteDeps, registerWageSettlementRoutes } from './wage_http.js';
// Arrears — the ADR-0012 carry-forward record type + persistence seam (recording
// only; recovery ordering is OD-7).
export {
  type ArrearsCategory,
  type ArrearsRecord,
  type WaiverRecord,
  type ArrearsLedger,
  type RecoveryLine,
  type RecoveryPlan,
  type RecoveryMeta,
  arrearsFrom,
  waiverFrom,
  planArrearsRecovery,
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
  type SlaSweepResult,
  InMemoryRemittanceStore,
  InMemoryOperatorEscalations,
  escalateIfStalled,
  sweepRemittanceSla,
} from './remittance_ledger.js';
export { type RemittanceRouteDeps, registerRemittanceRoutes } from './remittance_http.js';
// Service-to-service auth (rails, jobs, tooling) — a Founder/ops-owned shared
// secret, constant-time verified. Distinct from the Member session boundary.
export {
  SERVICE_TOKEN_HEADER,
  type ServiceAuthenticator,
  SecretServiceAuthenticator,
} from './service_auth.js';
// Remittance rail webhook adapter (R4 infra) — service-authed, idempotent
// sent/recipient_available/settled transitions over the same RemittanceStore.
export { type RemittanceRailRouteDeps, registerRemittanceRailRoutes } from './rail_http.js';
// Service-authed ops/scheduler triggers (infra) — external scheduler → HTTP; the
// remittance SLA sweep now, savings jobs as they land.
export { type OpsRouteDeps, registerOpsRoutes } from './ops_http.js';
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
// Offline write reconciliation (R6; ADR-0015) — per record class: money
// server-authoritative-with-reconciliation, intent last-write-wins, append merge.
export {
  type RecordClass,
  type SyncRecord,
  type OfflineWrite,
  type ReconcileOutcome,
  type ReconcileResult,
  type SyncStore,
  type ReconciliationItem,
  type ReconciliationQueue,
  reconcile,
  applyOfflineWrite,
  InMemorySyncStore,
  InMemoryReconciliationQueue,
} from './offline_sync.js';
export { type SyncRouteDeps, registerSyncRoutes } from './sync_http.js';
// Savings withdrawal mechanics (R7; ADR-0016) — instant-to-Wallet, T+n settle,
// interest to the Member net of a disclosed fee, no early-withdrawal penalty. The
// rate/formula is the InterestAccrualPolicy seam (Founder-owned pricing; zero
// default until supplied), `n` is settleAfterMs config — neither invented here.
export {
  type SavingsAccount,
  type InterestAccrualPolicy,
  type WithdrawalState,
  type WithdrawalEvent,
  type Withdrawal,
  NoInterestAccrualPolicy,
  openAccount,
  balancePaise,
  deposit,
  accrueInterest,
  requestWithdrawal,
  settleWithdrawal,
} from './savings.js';
export {
  type SavingsAccountStore,
  type WithdrawalStore,
  type AccrualJobResult,
  type SettlementJobResult,
  InMemorySavingsAccountStore,
  InMemoryWithdrawalStore,
  accrueAllSavings,
  settleDueWithdrawals,
} from './savings_ledger.js';
export { type SavingsRouteDeps, registerSavingsRoutes } from './savings_http.js';
