import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import type { FocusSession, TimerState } from '../types/focusflow';
import {
  formatCompactDayLabel,
  formatLongDate,
  getTodayDateString,
} from '../utils/dateTime';
import type { FourWeekProgramSummary } from '../utils/programStats';
import { MAX_SESSIONS_PER_DAY, sortSessionsChronologically } from '../utils/scheduleValidation';
import { SessionRow } from './SessionRow';

interface ScheduleViewProps {
  sessions: FocusSession[];
  program: FourWeekProgramSummary;
  timer: TimerState;
  onOpenScheduleModal: (date: string) => void;
  onReschedule: (session: FocusSession) => void;
  onStartOrResume: (session: FocusSession) => void;
  onPause: () => void;
  onRequestComplete: (session: FocusSession) => void;
  onMarkInterrupted: (session: FocusSession) => void;
  onDelete: (session: FocusSession) => void;
}

export function ScheduleView({
  sessions,
  program,
  timer,
  onOpenScheduleModal,
  onReschedule,
  onStartOrResume,
  onPause,
  onRequestComplete,
  onMarkInterrupted,
  onDelete,
}: ScheduleViewProps) {
  const todayStr = getTodayDateString();
  const initialWeek = program.currentWeekNumber || 1;
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(initialWeek);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const activeWeek = program.weeks.find((w) => w.weekNumber === initialWeek);
    if (activeWeek && activeWeek.days.some((d) => d.date === todayStr)) {
      return todayStr;
    }
    return activeWeek?.startDate || todayStr;
  });

  const selectedWeek =
    program.weeks.find((w) => w.weekNumber === selectedWeekNumber) || program.weeks[0];

  const handleWeekChange = (weekNumber: number) => {
    setSelectedWeekNumber(weekNumber);
    const week = program.weeks.find((w) => w.weekNumber === weekNumber);
    if (week) {
      if (week.days.some((d) => d.date === todayStr)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(week.startDate);
      }
    }
  };

  const daySessions = useMemo(
    () => sortSessionsChronologically(sessions.filter((s) => s.date === selectedDate)),
    [sessions, selectedDate]
  );

  const slotsRemaining = Math.max(0, MAX_SESSIONS_PER_DAY - daySessions.length);

  return (
    <div className="space-y-6">
      {/* Week Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#EAE2F8] p-1">
          {program.weeks.map((week) => {
            const active = week.weekNumber === selectedWeek.weekNumber;
            return (
              <button
                key={week.weekNumber}
                type="button"
                onClick={() => handleWeekChange(week.weekNumber)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white text-[#2E1065] shadow-xs'
                    : 'text-[#5A4E73] hover:text-[#1D1530]'
                }`}
              >
                {week.label}
                {week.isCurrentWeek ? ' · Current' : ''}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-[#5A4E73] font-mono tabular-nums">
          {selectedWeek.dateRangeLabel} · {selectedWeek.completedCount}/{selectedWeek.plannedCount} completed
        </p>
      </div>

      {/* 7-Day Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {selectedWeek.days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === todayStr;
          const label = formatCompactDayLabel(day.date);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[#3B1D6E] bg-[#2E1065] text-white'
                  : 'border-[#E4DCF2] bg-white text-[#1D1530] hover:bg-[#FAF8FF]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={isSelected ? 'text-[#DDD6FE]' : 'text-[#5A4E73]'}>
                  {label.dayName}
                </span>
                {isToday && (
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected ? 'text-[#DDD6FE]' : 'text-[#5B21B6]'
                    }`}
                  >
                    Today
                  </span>
                )}
              </div>
              <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                {label.month} {label.dayNum}
              </p>
              <p
                className={`mt-2 font-mono text-xs tabular-nums ${
                  isSelected ? 'text-[#DDD6FE]' : 'text-[#5A4E73]'
                }`}
              >
                {day.planned}/{MAX_SESSIONS_PER_DAY} blocks
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day Schedule */}
      <section className="rounded-xl border border-[#E4DCF2] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE2F8]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#1D1530]">
              {formatLongDate(selectedDate)}
            </h2>
            <p className="mt-1 text-xs text-[#5A4E73]">
              FocusFlow limits each day to exactly two protected 90-minute deep-work sessions,
              leaving the rest of your calendar unscheduled and flexible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenScheduleModal(selectedDate)}
            disabled={slotsRemaining === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3B1D6E] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] disabled:bg-[#EAE2F8] disabled:text-[#7B6E94] disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>
              {slotsRemaining > 0
                ? `Schedule Session (${slotsRemaining} left)`
                : 'Daily 2-Block Limit Reached'}
            </span>
          </button>
        </div>

        {daySessions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-[#1D1530]">
              No deep-work sessions scheduled for {formatLongDate(selectedDate)}.
            </p>
            <p className="mt-1 text-xs text-[#5A4E73] max-w-md mx-auto">
              Choose up to two 90-minute windows aligned with your natural energy peaks.
            </p>
            <button
              type="button"
              onClick={() => onOpenScheduleModal(selectedDate)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#D8CEEA] bg-white px-4 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer"
            >
              <CalendarPlus className="h-4 w-4 text-[#5B21B6]" />
              <span>Schedule 90-Minute Block</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE2F8] pt-4">
            {daySessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isActiveTimerSession={timer.activeSessionId === session.id}
                timerStatus={timer.status}
                onStartOrResume={onStartOrResume}
                onPause={onPause}
                onReschedule={onReschedule}
                onRequestComplete={onRequestComplete}
                onMarkInterrupted={onMarkInterrupted}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
