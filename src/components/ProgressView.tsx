import { useMemo, useState } from 'react';
import type { FocusSession, SessionStatus } from '../types/focusflow';
import { formatShortDate, formatTimeRange } from '../utils/dateTime';
import type { FourWeekProgramSummary } from '../utils/programStats';
import { sortSessionsChronologically } from '../utils/scheduleValidation';
import { FourWeekOverviewChart, WeeklyDailyBreakdownChart } from './ProgressCharts';

interface ProgressViewProps {
  sessions: FocusSession[];
  program: FourWeekProgramSummary;
  weeklyTargetPercent: number;
}

type StatusFilter = 'all' | SessionStatus;

export function ProgressView({
  sessions,
  program,
  weeklyTargetPercent,
}: ProgressViewProps) {
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(
    program.currentWeekNumber || 1
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const selectedWeek =
    program.weeks.find((w) => w.weekNumber === selectedWeekNumber) || program.weeks[0];

  const filteredSessions = useMemo(() => {
    const inWeek = sessions.filter(
      (s) => s.date >= selectedWeek.startDate && s.date <= selectedWeek.endDate
    );
    const byStatus =
      statusFilter === 'all' ? inWeek : inWeek.filter((s) => s.status === statusFilter);
    return sortSessionsChronologically(byStatus);
  }, [sessions, selectedWeek, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Program Summary Bar */}
      <section className="rounded-xl border border-[#E4DCF2] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE2F8]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#1D1530]">
              Four-Week Productivity Program
            </h2>
            <p className="mt-1 text-xs text-[#5A4E73]">
              {program.programPhase === 'active' && program.currentWeekNumber
                ? `Currently in Week ${program.currentWeekNumber} of 4 · ${program.weeksRemaining} ${program.weeksRemaining === 1 ? 'week' : 'weeks'} remaining · ${program.daysRemainingInCurrentWeek} days left in current week`
                : program.programPhase === 'before'
                ? `Scheduled to begin ${formatShortDate(program.programStartDate)}`
                : 'Four-week cycle complete. Review results or start a new cycle in Preferences.'}
            </p>
          </div>
          <div className="font-mono text-xs tabular-nums text-[#1D1530]">
            Program Overall: <span className="font-semibold">{program.totalCompleted}/{program.totalPlanned}</span> ({program.overallCompletionRate}%)
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {program.weeks.map((week) => {
            const isSelected = week.weekNumber === selectedWeek.weekNumber;
            return (
              <button
                key={week.weekNumber}
                type="button"
                onClick={() => setSelectedWeekNumber(week.weekNumber)}
                className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#3B1D6E] bg-[#F3EEFA]'
                    : 'border-[#E4DCF2] bg-white hover:bg-[#FAF8FF]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1D1530]">
                    {week.label}
                    {week.isCurrentWeek ? ' · Current' : ''}
                  </span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      week.plannedCount === 0
                        ? 'text-[#8E82A8]'
                        : week.targetMet
                        ? 'text-[#15803D]'
                        : 'text-[#5B21B6]'
                    }`}
                  >
                    {week.plannedCount > 0 ? `${week.completionRate}%` : '—'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#5A4E73]">{week.dateRangeLabel}</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE2F8]">
                  <div
                    className={`h-full rounded-full ${
                      week.targetMet ? 'bg-[#15803D]' : 'bg-[#3B1D6E]'
                    }`}
                    style={{ width: `${Math.min(100, week.completionRate)}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[11px] tabular-nums text-[#5A4E73]">
                  {week.completedCount}/{week.plannedCount} completed · {week.interruptedCount} interrupted
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Week Progress & Target Indicator */}
      <section className="rounded-xl border border-[#E4DCF2] bg-white p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-[#1D1530]">
              {selectedWeek.label} Target Progress ({selectedWeek.dateRangeLabel})
            </h3>
            <p className="mt-0.5 text-xs text-[#5A4E73]">
              Weekly target: at least {weeklyTargetPercent}% of planned sessions completed
            </p>
          </div>
          <div className="font-mono text-sm font-semibold tabular-nums text-[#1D1530]">
            {selectedWeek.completedCount} / {selectedWeek.plannedCount} sessions ({selectedWeek.completionRate}%)
            {selectedWeek.plannedCount > 0 && (
              <span
                className={`ml-2 text-xs ${
                  selectedWeek.targetMet ? 'text-[#15803D]' : 'text-[#B45309]'
                }`}
              >
                {selectedWeek.targetMet ? '· Target Met' : '· Below Target'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar with 80% Target Marker */}
        <div className="relative pt-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#EDE9FE]">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                selectedWeek.targetMet ? 'bg-[#15803D]' : 'bg-[#3B1D6E]'
              }`}
              style={{ width: `${Math.min(100, selectedWeek.completionRate)}%` }}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#1D1530]"
            style={{ left: `${weeklyTargetPercent}%` }}
            title={`${weeklyTargetPercent}% target threshold`}
          />
          <div
            className="mt-1.5 font-mono text-[11px] tabular-nums text-[#5A4E73]"
            style={{ paddingLeft: `calc(${weeklyTargetPercent}% - 26px)` }}
          >
            {weeklyTargetPercent}% goal
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#EAE2F8]">
          <WeeklyDailyBreakdownChart week={selectedWeek} />
          <FourWeekOverviewChart
            weeks={program.weeks}
            weeklyTargetPercent={weeklyTargetPercent}
            selectedWeekNumber={selectedWeek.weekNumber}
            onSelectWeek={setSelectedWeekNumber}
          />
        </div>
      </section>

      {/* Session Log Table */}
      <section className="rounded-xl border border-[#E4DCF2] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2F8]">
          <div>
            <h3 className="font-display text-base font-semibold text-[#1D1530]">
              {selectedWeek.label} Session Log
            </h3>
            <p className="mt-0.5 text-xs text-[#5A4E73]">
              Detailed record of planned, completed, and interrupted 90-minute sessions
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg bg-[#EAE2F8] p-1">
            {(['all', 'completed', 'scheduled', 'interrupted'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white text-[#2E1065] shadow-xs'
                    : 'text-[#5A4E73] hover:text-[#1D1530]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="py-10 text-center text-xs text-[#5A4E73]">
            No {statusFilter === 'all' ? '' : `${statusFilter} `}sessions recorded for {selectedWeek.label}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE2F8] text-[#5A4E73]">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Window</th>
                  <th className="py-3 pr-4 font-medium">Core Deliverable</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Focused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2F8]">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-[#FAF8FF]">
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#5A4E73] whitespace-nowrap">
                      {formatShortDate(session.date)}
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#1D1530] whitespace-nowrap">
                      {formatTimeRange(session.startTime)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#1D1530] max-w-xs truncate">
                      {session.deliverable}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span
                        className={`font-medium capitalize ${
                          session.status === 'completed'
                            ? 'text-[#15803D]'
                            : session.status === 'interrupted'
                            ? 'text-[#B45309]'
                            : 'text-[#5B21B6]'
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#5A4E73] whitespace-nowrap">
                      {session.actualFocusedSeconds !== undefined
                        ? `${Math.round(session.actualFocusedSeconds / 60)} min`
                        : session.status === 'completed'
                        ? '90 min'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
