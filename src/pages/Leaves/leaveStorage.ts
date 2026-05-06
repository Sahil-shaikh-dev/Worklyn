import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deriveLeaveBalances,
  getMonthlyAccrualTotalFromMonth,
  sumUsedFromEntries,
  type LeaveBalanceBaseline,
} from './leaveBalanceMath';
import type { LeaveDurationKind, LeaveEntry } from './leaveTimelineFormat';

const STORAGE_KEY = 'worklyn:leaves:v1';

type SerializedLeaveEntry = Readonly<{
  id: string;
  at: string;
  duration: LeaveDurationKind;
  reason: string;
}>;

type SerializedLeavesSnapshot = Readonly<{
  v: 1;
  accrualStartMonth: string;
  manualBaseline: LeaveBalanceBaseline;
  leaveEntries: SerializedLeaveEntry[];
}>;

export type LeavesSnapshot = Readonly<{
  accrualStartMonth: Date;
  manualBaseline: LeaveBalanceBaseline;
  leaveEntries: LeaveEntry[];
}>;

export function createDefaultLeavesSnapshot(now: Date): LeavesSnapshot {
  const initialAccrualTotal = getMonthlyAccrualTotalFromMonth(now, now);
  return {
    accrualStartMonth: now,
    manualBaseline: {
      remaining: 0,
      used: 0,
      entryUsedAtSet: 0,
      accrualAtSet: initialAccrualTotal,
    },
    leaveEntries: [],
  };
}

function isDurationKind(value: unknown): value is LeaveDurationKind {
  return value === 'full_day' || value === 'half_first' || value === 'half_second';
}

function parseDateOrNull(value: unknown): Date | null {
  if (typeof value !== 'string' || value === '') {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isValidBaseline(value: unknown): value is LeaveBalanceBaseline {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const baseline = value as Record<string, unknown>;
  return (
    typeof baseline.remaining === 'number' &&
    Number.isFinite(baseline.remaining) &&
    typeof baseline.used === 'number' &&
    Number.isFinite(baseline.used) &&
    typeof baseline.entryUsedAtSet === 'number' &&
    Number.isFinite(baseline.entryUsedAtSet) &&
    typeof baseline.accrualAtSet === 'number' &&
    Number.isFinite(baseline.accrualAtSet)
  );
}

function parseLeaveEntries(value: unknown): LeaveEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsed: LeaveEntry[] = [];
  for (const row of value) {
    if (
      row == null ||
      typeof row !== 'object' ||
      typeof (row as { id?: unknown }).id !== 'string' ||
      !isDurationKind((row as { duration?: unknown }).duration) ||
      typeof (row as { reason?: unknown }).reason !== 'string'
    ) {
      continue;
    }

    const at = parseDateOrNull((row as { at?: unknown }).at);
    if (at == null) {
      continue;
    }

    parsed.push({
      id: (row as { id: string }).id,
      at,
      duration: (row as { duration: LeaveDurationKind }).duration,
      reason: (row as { reason: string }).reason,
    });
  }

  return parsed;
}

function canonicalizeBaselineAtLoad(
  accrualStartMonth: Date,
  baseline: LeaveBalanceBaseline,
  leaveEntries: readonly LeaveEntry[],
  now: Date,
): LeaveBalanceBaseline {
  const entryUsedNow = sumUsedFromEntries(leaveEntries);
  const accrualNow = getMonthlyAccrualTotalFromMonth(accrualStartMonth, now);
  const effective = deriveLeaveBalances(baseline, entryUsedNow, accrualNow);

  return {
    remaining: effective.remaining,
    used: effective.used,
    entryUsedAtSet: entryUsedNow,
    accrualAtSet: accrualNow,
  };
}

function serialize(snapshot: LeavesSnapshot): SerializedLeavesSnapshot {
  return {
    v: 1,
    accrualStartMonth: snapshot.accrualStartMonth.toISOString(),
    manualBaseline: snapshot.manualBaseline,
    leaveEntries: snapshot.leaveEntries.map(entry => ({
      id: entry.id,
      at: entry.at.toISOString(),
      duration: entry.duration,
      reason: entry.reason,
    })),
  };
}

export async function loadLeavesSnapshot(now: Date): Promise<LeavesSnapshot> {
  const fallback = createDefaultLeavesSnapshot(now);

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === '') {
      return fallback;
    }

    const data = JSON.parse(raw) as SerializedLeavesSnapshot;
    if (data.v !== 1) {
      return fallback;
    }

    const accrualStartMonth = parseDateOrNull(data.accrualStartMonth);
    if (accrualStartMonth == null || !isValidBaseline(data.manualBaseline)) {
      return fallback;
    }

    const leaveEntries = parseLeaveEntries(data.leaveEntries);

    return {
      accrualStartMonth,
      manualBaseline: canonicalizeBaselineAtLoad(
        accrualStartMonth,
        data.manualBaseline,
        leaveEntries,
        now,
      ),
      leaveEntries,
    };
  } catch {
    return fallback;
  }
}

export async function saveLeavesSnapshot(snapshot: LeavesSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(snapshot)));
}
