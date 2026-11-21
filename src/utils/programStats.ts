import type { FocusSession } from '../types/focusflow';
import { addDays, diffDays, formatDateRange, getTodayDateString } from './dateTime';

export interface DaySummary {
  date: string;
  planned: number;
  completed: number;
  interrupted: number;
  scheduledPending: number;
}

export interface WeekSummary {
  weekNumber: number; // 1..4
  label: string;
  startDate: string;
  endDate: string;
  dateRangeLabel: string;
  days: DaySummary[];
  plannedCount: number;
  completedCount: number;
  interruptedCount: number;
  scheduledPendingCount: number;
  completionRate: number;
  targetMet: boolean;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
}

export interface FourWeekProgramSummary {
  programStartDate: string;
  programEndDate: string;
  currentWeekNumber: number | null; // 1..4 if inside window, null if outside
  programPhase: 'before' | 'active' | 'completed';
  weeksRemaining: number;
  daysRemainingInCurrentWeek: number;
  weeks: WeekSummary[];
  totalPlanned: number;
  totalCompleted: number;
  totalInterrupted: number;
  totalScheduledPending: number;
  overallCompletionRate: number;
  totalFocusedMinutes: number;
}

export function computeFourWeekProgram(
  sessions: FocusSession[],
  programStartDate: string,
  weeklyTargetPercent: number,
  todayDate: string = getTodayDateString()
): FourWeekProgramSummary {
  const daysSinceStart = diffDays(programStartDate, todayDate);
  let programPhase: 'before' | 'active' | 'completed' = 'active';
  let currentWeekNumber: number | null = null;
  let weeksRemaining = 4;
  let daysRemainingInCurrentWeek = 7;

  if (daysSinceStart < 0) {
    programPhase = 'before';
    weeksRemaining = 4;
    daysRemainingInCurrentWeek = 7;
  } else if (daysSinceStart >= 28) {
    programPhase = 'completed';
    weeksRemaining = 0;
    daysRemainingInCurrentWeek = 0;
  } else {
    programPhase = 'active';
    currentWeekNumber = Math.floor(daysSinceStart / 7) + 1; // 1..4
    weeksRemaining = 4 - currentWeekNumber;
    const dayIndexInWeek = daysSinceStart % 7;
    daysRemainingInCurrentWeek = 7 - dayIndexInWeek;
  }

  const weeks: WeekSummary[] = [];

  for (let w = 0; w < 4; w++) {
    const startDate = addDays(programStartDate, w * 7);
    const endDate = addDays(startDate, 6);
    const weekNumber = w + 1;

    const days: DaySummary[] = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = addDays(startDate, d);
      const daySessions = sessions.filter((s) => s.date === dayDate);
      days.push({
        date: dayDate,
        planned: daySessions.length,
        completed: daySessions.filter((s) => s.status === 'completed').length,
        interrupted: daySessions.filter((s) => s.status === 'interrupted').length,
        scheduledPending: daySessions.filter((s) => s.status === 'scheduled').length,
      });
    }

    const plannedCount = days.reduce((acc, day) => acc + day.planned, 0);
    const completedCount = days.reduce((acc, day) => acc + day.completed, 0);
    const interruptedCount = days.reduce((acc, day) => acc + day.interrupted, 0);
    const scheduledPendingCount = days.reduce((acc, day) => acc + day.scheduledPending, 0);
    const completionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

    weeks.push({
      weekNumber,
      label: `Week ${weekNumber}`,
      startDate,
      endDate,
      dateRangeLabel: formatDateRange(startDate, endDate),
      days,
      plannedCount,
      completedCount,
      interruptedCount,
      scheduledPendingCount,
      completionRate,
      targetMet: plannedCount > 0 && completionRate >= weeklyTargetPercent,
      isCurrentWeek: currentWeekNumber === weekNumber,
      isPastWeek: todayDate > endDate,
    });
  }

  const programEndDate = addDays(programStartDate, 27);
  const totalPlanned = weeks.reduce((acc, w) => acc + w.plannedCount, 0);
  const totalCompleted = weeks.reduce((acc, w) => acc + w.completedCount, 0);
  const totalInterrupted = weeks.reduce((acc, w) => acc + w.interruptedCount, 0);
  const totalScheduledPending = weeks.reduce((acc, w) => acc + w.scheduledPendingCount, 0);
  const overallCompletionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  const programSessions = sessions.filter(
    (s) => s.date >= programStartDate && s.date <= programEndDate
  );
  const totalFocusedMinutes = programSessions.reduce((acc, s) => {
    if (s.status === 'completed') {
      return acc + (s.actualFocusedSeconds ? Math.round(s.actualFocusedSeconds / 60) : 90);
    }
    if (s.status === 'interrupted' && s.actualFocusedSeconds) {
      return acc + Math.round(s.actualFocusedSeconds / 60);
    }
    return acc;
  }, 0);

  return {
    programStartDate,
    programEndDate,
    currentWeekNumber,
    programPhase,
    weeksRemaining,
    daysRemainingInCurrentWeek,
    weeks,
    totalPlanned,
    totalCompleted,
    totalInterrupted,
    totalScheduledPending,
    overallCompletionRate,
    totalFocusedMinutes,
  };
}
