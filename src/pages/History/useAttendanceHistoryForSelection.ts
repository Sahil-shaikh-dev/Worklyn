import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAttendanceHistoryDay } from '../../features/attendance/history';
import { getLocalCalendarDayKey } from '../../features/attendance/session/localCalendarDayKey';
import type { AttendanceEvent } from '../../features/attendance/types';

export type AttendanceHistorySelection = Readonly<{
  events: readonly AttendanceEvent[];
  asOf: Date;
}>;

/**
 * Resolves timeline + summary inputs for History: live session for today, AsyncStorage archive for past days.
 */
export function useAttendanceHistoryForSelection(
  selectedDayKey: string,
  sessionNow: Date,
  liveEvents: readonly AttendanceEvent[],
): AttendanceHistorySelection {
  const y = sessionNow.getFullYear();
  const mo = sessionNow.getMonth();
  const d = sessionNow.getDate();
  const todayKey = useMemo(
    () => getLocalCalendarDayKey(new Date(y, mo, d)),
    [d, mo, y],
  );

  const isToday = selectedDayKey === todayKey;
  const [pastEvents, setPastEvents] = useState<readonly AttendanceEvent[]>([]);

  const loadPast = useCallback(async () => {
    if (selectedDayKey === todayKey) {
      setPastEvents([]);
      return;
    }
    const evs = await getAttendanceHistoryDay(selectedDayKey, new Date());
    setPastEvents(evs);
  }, [selectedDayKey, todayKey]);

  useEffect(() => {
    loadPast().catch(() => {
      /* ignore */
    });
  }, [loadPast]);

  useFocusEffect(
    useCallback(() => {
      loadPast().catch(() => {
        /* ignore */
      });
    }, [loadPast]),
  );

  const events = isToday ? liveEvents : pastEvents;

  const asOf = useMemo(() => {
    if (events.length === 0) {
      return sessionNow;
    }
    return new Date(Math.max(...events.map(e => e.at.getTime()), sessionNow.getTime()));
  }, [events, sessionNow]);

  return useMemo(
    () => ({
      asOf,
      events,
    }),
    [asOf, events],
  );
}
