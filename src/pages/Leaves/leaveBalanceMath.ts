import type { LeaveDurationKind, LeaveEntry } from './leaveTimelineFormat';

const HALF_STEP = 0.5;
const HALF_STEP_EPS = 1e-9;
const MONTHLY_ACCRUAL = 1.5;

export type LeaveBalanceBaseline = Readonly<{
  remaining: number;
  used: number;
  entryUsedAtSet: number;
  accrualAtSet: number;
}>;

function monthStamp(at: Date): number {
  return at.getFullYear() * 12 + at.getMonth();
}

export function normalizeHalfStep(value: number): number {
  return Math.round(value / HALF_STEP) * HALF_STEP;
}

export function leaveUsageForDuration(duration: LeaveDurationKind): number {
  return duration === 'full_day' ? 1 : 0.5;
}

export function sumUsedFromEntries(entries: readonly LeaveEntry[]): number {
  const total = entries.reduce(
    (sum, entry) => sum + leaveUsageForDuration(entry.duration),
    0,
  );
  return normalizeHalfStep(total);
}

export function getMonthlyAccrualTotalFromMonth(
  accrualStartMonth: Date,
  now: Date,
): number {
  const months = monthStamp(now) - monthStamp(accrualStartMonth) + 1;
  const clampedMonths = Math.max(0, months);
  return normalizeHalfStep(clampedMonths * MONTHLY_ACCRUAL);
}

export function clampUsedToEntryMinimum(used: number, entryUsed: number): number {
  return Math.max(normalizeHalfStep(used), normalizeHalfStep(entryUsed));
}

export function buildNextBaseline(
  requested: Readonly<{ remaining: number; used: number }>,
  entryUsedNow: number,
  accrualNow: number,
): LeaveBalanceBaseline {
  return {
    remaining: normalizeHalfStep(requested.remaining),
    used: clampUsedToEntryMinimum(requested.used, entryUsedNow),
    entryUsedAtSet: normalizeHalfStep(entryUsedNow),
    accrualAtSet: normalizeHalfStep(accrualNow),
  };
}

export function deriveLeaveBalances(
  baseline: LeaveBalanceBaseline,
  entryUsedNow: number,
  accrualNow: number,
): Readonly<{ remaining: number; used: number }> {
  const entryDelta = normalizeHalfStep(entryUsedNow - baseline.entryUsedAtSet);
  const accrualDelta = normalizeHalfStep(accrualNow - baseline.accrualAtSet);
  const usedRaw = normalizeHalfStep(baseline.used + entryDelta);
  const used = clampUsedToEntryMinimum(usedRaw, entryUsedNow);
  const remaining = normalizeHalfStep(baseline.remaining + accrualDelta - entryDelta);

  if (Math.abs(remaining) < HALF_STEP_EPS) {
    return { remaining: 0, used };
  }
  return { remaining, used };
}

