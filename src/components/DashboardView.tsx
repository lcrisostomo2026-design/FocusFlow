import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Maximize2,
  Pause,
  Play,
} from 'lucide-react';
import type { FocusSession, NavigationTab, TimerState } from '../types/focusflow';
import { formatCountdown, formatLongDate, formatTimeRange, getTodayDateString } from '../utils/dateTime';
import type { FourWeekProgramSummary } from '../utils/programStats';
import { MAX_SESSIONS_PER_DAY } from '../utils/scheduleValidation';
import { FourWeekOverviewChart } from './ProgressCharts';
import { SessionRow } from './SessionRow';

interface DashboardViewProps {
  todaySessions: FocusSession[];
  activeSession: FocusSession | null;
  timer: TimerState;
  remainingSeconds: number;
  progressPercent: number;
  program: FourWeekProgramSummary;
  weeklyTargetPercent: number;
  onStartOrResume: (session: FocusSession) => void;
  onPause: () => void;
  onRequestComplete: (session: FocusSession) => void;
  onMarkInterrupted: (session: FocusSession) => void;
  onReschedule: (session: FocusSession) => void;
  onDelete: (session: FocusSession) => void;
  onOpenScheduleModal: (date?: string) => void;
  onEnterFocusMode: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export function DashboardView({
  todaySessions,
  activeSession,
  timer,
  remainingSeconds,
  progressPercent,
  program,
  weeklyTargetPercent,
  onStartOrResume,
  onPause,
  onRequestComplete,
  onMarkInterrupted,
  onReschedule,
  onDelete,
  onOpenScheduleModal,
  onEnterFocusMode,
  onNavigate,
}: DashboardViewProps) {
  const todayStr = getTodayDateString();
  const nextScheduledToday = todaySessions.find((s) => s.status === 'scheduled') || null;
  const heroSession = activeSession || nextScheduledToday;

  const currentWeek =
    program.weeks.find((w) => w.isCurrentWeek) ||
    program.weeks[program.weeks.length - 1];

  const remainingTodaySlots = Math.max(0, MAX_SESSIONS_PER_DAY - todaySessions.length);

  return (
    <div className="space-y-8">
      {/* Dominant Focal Anchor: Active / Next Focus Timer */}
      <section className="rounded-xl border border-[#3B1D6E] bg-[#2E1065] text-white p-6 sm:p-8 shadow-sm">
        {heroSession ? (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2.5 min-w-0 flex-1">
              <p className="text-xs font-medium text-[#DDD6FE]">
                {activeSession
                  ? timer.status === 'running'
                    ? 'Active Deep-Work Session'
                    : 'Paused Deep-Work Session'
                  : "Next Today's Scheduled Block"}
                {' · '}
                <span className="font-mono tabular-nums">
                  {formatTimeRange(heroSession.startTime)}
                </span>
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug [text-wrap:balance]">
                {heroSession.deliverable}
              </h2>
              <div className="pt-2 max-w-md">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#4C2A8A]">
                  <div
                    className="h-full rounded-full bg-[#DDD6FE] transition-[width] duration-300"
                    style={{ width: `${activeSession ? progressPercent : 0}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-xs tabular-nums text-[#C4B5FD]">
                  {activeSession
                    ? `${Math.round(progressPercent)}% elapsed · 90-minute block`
                    : '90-minute block ready to start'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
              <div className="font-mono text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight text-white">
                {formatCountdown(activeSession ? remainingSeconds : 90 * 60)}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {activeSession && timer.status === 'running' ? (
                  <button
                    type="button"
                    onClick={onPause}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#2E1065] transition-colors hover:bg-[#EDE9FE] cursor-pointer whitespace-nowrap"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartOrResume(heroSession)}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#2E1065] transition-colors hover:bg-[#EDE9FE] cursor-pointer whitespace-nowrap"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{activeSession && timer.status === 'paused' ? 'Resume' : 'Start 90m Timer'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRequestComplete(heroSession)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#6D48B2] bg-[#3B1D6E] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4C2A8A] cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Complete</span>
                </button>

                <button
                  type="button"
                  onClick={onEnterFocusMode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#6D48B2] bg-transparent px-3.5 py-2 text-xs font-medium text-[#EDE9FE] transition-colors hover:bg-[#3B1D6E] cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Focus Mode</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#DDD6FE]">
                {formatLongDate(todayStr)}
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-white">
                No active focus session scheduled right now.
              </h2>
              <p className="text-sm text-[#DDD6FE] max-w-xl">
                {todaySessions.length >= MAX_SESSIONS_PER_DAY
                  ? 'Both of today’s protected 90-minute blocks are finished. Review your progress or plan tomorrow.'
                  : 'Protect your highest-priority deliverable with a dedicated 90-minute block.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {remainingTodaySlots > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenScheduleModal(todayStr)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#2E1065] transition-colors hover:bg-[#EDE9FE] cursor-pointer whitespace-nowrap"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Schedule 90m Session</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#6D48B2] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#3B1D6E] cursor-pointer whitespace-nowrap"
              >
                <span>Open Planner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4-Column Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4DCF2] bg-white p-5">
          <p className="text-xs font-medium text-[#5A4E73]">
            {currentWeek ? `${currentWeek.label} Completion` : 'Weekly Completion'}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#1D1530]">
            {currentWeek && currentWeek.plannedCount > 0 ? `${currentWeek.completionRate}%` : '—'}
          </p>
          <p className="mt-1.5 text-xs text-[#5A4E73] font-mono tabular-nums">
            {currentWeek
              ? `${currentWeek.completedCount}/${currentWeek.plannedCount} sessions · Target ${weeklyTargetPercent}%`
              : `Target ${weeklyTargetPercent}%`}
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCF2] bg-white p-5">
          <p className="text-xs font-medium text-[#5A4E73]">Total Completed Sessions</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#1D1530]">
            {program.totalCompleted}
          </p>
          <p className="mt-1.5 text-xs text-[#5A4E73] font-mono tabular-nums">
            {Math.round((program.totalFocusedMinutes / 60) * 10) / 10} hrs focused in 4-week cycle
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCF2] bg-white p-5">
          <p className="text-xs font-medium text-[#5A4E73]">Four-Week Program</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#1D1530]">
            {program.programPhase === 'active' && program.currentWeekNumber
              ? `Week ${program.currentWeekNumber} of 4`
              : program.programPhase === 'before'
              ? 'Starts Soon'
              : '4 of 4 Done'}
          </p>
          <p className="mt-1.5 text-xs text-[#5A4E73] font-mono tabular-nums">
            {program.programPhase === 'active'
              ? `${program.weeksRemaining} ${program.weeksRemaining === 1 ? 'week' : 'weeks'} remaining`
              : `${program.overallCompletionRate}% program rate`}
          </p>
        </div>

        <div className="rounded-xl border border-[#E4DCF2] bg-white p-5">
          <p className="text-xs font-medium text-[#5A4E73]">Interrupted Sessions</p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[#1D1530]">
            {program.totalInterrupted}
          </p>
          <p className="mt-1.5 text-xs text-[#5A4E73] font-mono tabular-nums">
            {program.totalScheduledPending} scheduled upcoming
          </p>
        </div>
      </section>

      {/* Main Split: Today's Sessions + Four-Week Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Today's Scheduled Focus Sessions */}
        <section className="lg:col-span-6 rounded-xl border border-[#E4DCF2] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE2F8]">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1D1530]">
                Today&apos;s Focus Sessions
              </h2>
              <p className="mt-0.5 text-xs text-[#5A4E73]">
                {formatLongDate(todayStr)} · <span className="font-mono tabular-nums">{todaySessions.length}/{MAX_SESSIONS_PER_DAY}</span> daily blocks
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenScheduleModal(todayStr)}
              disabled={remainingTodaySlots === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B1D6E] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] disabled:bg-[#EAE2F8] disabled:text-[#7B6E94] disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>{remainingTodaySlots > 0 ? 'Add Block' : '2/2 Protected'}</span>
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-[#1D1530]">
                No deep-work blocks scheduled for today yet.
              </p>
              <p className="mt-1 text-xs text-[#5A4E73] max-w-sm mx-auto">
                Schedule up to two 90-minute sessions dedicated to your primary deliverables.
              </p>
              <button
                type="button"
                onClick={() => onOpenScheduleModal(todayStr)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-4 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#5B21B6]" />
                <span>Schedule First Block</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE2F8] pt-4">
              {todaySessions.map((session) => (
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

        {/* Four-Week Progress Overview */}
        <section className="lg:col-span-6 rounded-xl border border-[#E4DCF2] bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE2F8]">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1D1530]">
                Four-Week Progress Overview
              </h2>
              <p className="mt-0.5 text-xs text-[#5A4E73]">
                Target at least {weeklyTargetPercent}% completion each calendar week
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#4C1D95] hover:text-[#2E1065] cursor-pointer whitespace-nowrap"
            >
              <span>Full Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <FourWeekOverviewChart
            weeks={program.weeks}
            weeklyTargetPercent={weeklyTargetPercent}
          />

          <div className="divide-y divide-[#EAE2F8] border-t border-[#EAE2F8] pt-2">
            {program.weeks.map((week) => (
              <div
                key={week.weekNumber}
                className="flex items-center justify-between gap-4 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-medium text-[#1D1530]">
                    {week.label}
                  </span>
                  {week.isCurrentWeek && (
                    <span className="ml-2 font-medium text-[#5B21B6]">· Current</span>
                  )}
                  <span className="ml-2 text-[#5A4E73]">{week.dateRangeLabel}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono tabular-nums">
                  <span className="text-[#5A4E73]">
                    {week.completedCount}/{week.plannedCount}
                  </span>
                  <span
                    className={`w-12 text-right font-semibold ${
                      week.plannedCount === 0
                        ? 'text-[#8E82A8]'
                        : week.targetMet
                        ? 'text-[#15803D]'
                        : 'text-[#1D1530]'
                    }`}
                  >
                    {week.plannedCount > 0 ? `${week.completionRate}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
