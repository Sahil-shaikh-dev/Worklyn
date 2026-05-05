import { dateFormatMedium } from '../../constants/dateTime/formats';

export type LeaveDurationKind = 'full_day' | 'half_first' | 'half_second';

export type LeaveEntry = Readonly<{
  id: string;
  at: Date;
  duration: LeaveDurationKind;
  reason: string;
}>;

export function createLeaveId(): string {
  const c = (
    globalThis as typeof globalThis & {
      crypto?: { randomUUID?: () => string };
    }
  ).crypto;
  if (c != null && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `leave-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const chipFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const headingFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  ...dateFormatMedium,
});

export function formatLeaveDateChip(at: Date): string {
  return chipFormatter.format(at);
}

export function formatLeaveDateHeading(at: Date): string {
  return headingFormatter.format(at);
}

export function leaveDurationCopy(kind: LeaveDurationKind): Readonly<{
  title: string;
  /** Shown after “Half day”, visually de-emphasized (first/second half). */
  titleSuffix?: string;
  subtitle?: string;
  variant: 'full' | 'half';
}> {
  switch (kind) {
    case 'full_day':
      return { title: 'Full day', variant: 'full' };
    case 'half_first':
      return {
        title: 'Half day',
        titleSuffix: 'First half',
        variant: 'half',
      };
    case 'half_second':
      return {
        title: 'Half day',
        titleSuffix: 'Second half',
        variant: 'half',
      };
  }
}
