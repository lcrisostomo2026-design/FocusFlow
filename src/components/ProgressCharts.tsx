import { useState } from 'react';
import { formatCompactDayLabel } from '../utils/dateTime';
import type { WeekSummary } from '../utils/programStats';

interface FourWeekOverviewChartProps {
  weeks: WeekSummary[];
  weeklyTargetPercent: number;
  selectedWeekNumber?: number;
  onSelectWeek?: (weekNumber: number) => void;
}

export function FourWeekOverviewChart({
  weeks,
  weeklyTargetPercent,
  selectedWeekNumber,
  onSelectWeek,
}: FourWeekOverviewChartProps) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const maxSessions = Math.max(
    4,
    ...weeks.map((w) => w.plannedCount)
  );

  const chartHeight = 160;
  const chartWidth = 480;
  const padLeft = 32;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 34;
  const innerHeight = chartHeight - padTop - padBottom;
  const innerWidth = chartWidth - padLeft - padRight;
  const groupWidth = innerWidth / 4;

  const activeTooltipWeek = weeks.find((w) => w.weekNumber === hoveredWeek) || null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A4E73]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#DDD6FE] border border-[#C4B5FD]" />
            <span>Planned</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#3B1D6E]" />
            <span>Completed</span>
          </span>
        </div>
        <span className="font-mono tabular-nums text-[#5B21B6]">
          Target: {weeklyTargetPercent}%+ weekly
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
          role="img"
          aria-label="Four-week planned versus completed deep-work sessions chart"
        >
          {[0, 0.5, 1].map((ratio) => {
            const y = padTop + innerHeight * (1 - ratio);
            const val = Math.round(maxSessions * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  x2={chartWidth - padRight}
                  y1={y}
                  y2={y}
                  stroke="#EAE2F8"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#6B5F86] text-[10px] font-mono tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {weeks.map((week, idx) => {
            const groupCenterX = padLeft + groupWidth * idx + groupWidth / 2;
            const barWidth = 22;
            const gap = 6;
            const plannedH = (week.plannedCount / maxSessions) * innerHeight;
            const completedH = (week.completedCount / maxSessions) * innerHeight;
            const isSelected = selectedWeekNumber === week.weekNumber;

            return (
              <g
                key={week.weekNumber}
                onMouseEnter={() => setHoveredWeek(week.weekNumber)}
                onMouseLeave={() => setHoveredWeek(null)}
                onClick={() => onSelectWeek?.(week.weekNumber)}
                className={onSelectWeek ? 'cursor-pointer' : undefined}
              >
                {isSelected && (
                  <rect
                    x={groupCenterX - 34}
                    y={padTop - 6}
                    width={68}
                    height={innerHeight + 12}
                    rx={6}
                    fill="#F3EEFA"
                  />
                )}
                {/* Planned Bar */}
                <rect
                  x={groupCenterX - barWidth - gap / 2}
                  y={padTop + innerHeight - plannedH}
                  width={barWidth}
                  height={Math.max(2, plannedH)}
                  rx={4}
                  fill="#DDD6FE"
                />
                {/* Completed Bar */}
                <rect
                  x={groupCenterX + gap / 2}
                  y={padTop + innerHeight - completedH}
                  width={barWidth}
                  height={Math.max(2, completedH)}
                  rx={4}
                  fill={week.targetMet ? '#3B1D6E' : '#6D28D9'}
                />
                <text
                  x={groupCenterX}
                  y={chartHeight - 14}
                  textAnchor="middle"
                  className="fill-[#1D1530] text-[11px] font-medium"
                >
                  {week.label}
                </text>
                <text
                  x={groupCenterX}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className="fill-[#5A4E73] text-[10px] font-mono tabular-nums"
                >
                  {week.plannedCount > 0 ? `${week.completionRate}%` : '—'}
                </text>
              </g>
            );
          })}
        </svg>

        {activeTooltipWeek && (
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#EAE2F8] bg-[#FAF8FF] px-3 py-2 text-xs text-[#1D1530]">
            <span className="font-medium">
              {activeTooltipWeek.label} ({activeTooltipWeek.dateRangeLabel})
            </span>
            <span className="font-mono tabular-nums text-[#5A4E73]">
              {activeTooltipWeek.completedCount}/{activeTooltipWeek.plannedCount} completed ({activeTooltipWeek.completionRate}%) · {activeTooltipWeek.interruptedCount} interrupted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface WeeklyDailyBreakdownChartProps {
  week: WeekSummary;
}

export function WeeklyDailyBreakdownChart({ week }: WeeklyDailyBreakdownChartProps) {
  const chartHeight = 148;
  const chartWidth = 480;
  const padLeft = 28;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 32;
  const innerHeight = chartHeight - padTop - padBottom;
  const innerWidth = chartWidth - padLeft - padRight;
  const colWidth = innerWidth / 7;
  const maxDaily = 2; // Strictly max 2 deep-work blocks per day

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#5A4E73]">
        <span>Daily 90-Minute Blocks (Max 2/day)</span>
        <span className="font-mono tabular-nums">
          {week.completedCount} of {week.plannedCount} planned completed
        </span>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-40 overflow-visible"
        role="img"
        aria-label={`Daily deep-work blocks for ${week.label}`}
      >
        {[0, 1, 2].map((val) => {
          const y = padTop + innerHeight * (1 - val / maxDaily);
          return (
            <g key={val}>
              <line
                x1={padLeft}
                x2={chartWidth - padRight}
                y1={y}
                y2={y}
                stroke="#EAE2F8"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#6B5F86] text-[10px] font-mono tabular-nums"
              >
                {val}
              </text>
            </g>
          );
        })}

        {week.days.map((day, idx) => {
          const centerX = padLeft + colWidth * idx + colWidth / 2;
          const barW = 14;
          const plannedH = (day.planned / maxDaily) * innerHeight;
          const completedH = (day.completed / maxDaily) * innerHeight;
          const label = formatCompactDayLabel(day.date);

          return (
            <g key={day.date}>
              <rect
                x={centerX - barW - 2}
                y={padTop + innerHeight - plannedH}
                width={barW}
                height={Math.max(2, plannedH)}
                rx={3}
                fill="#DDD6FE"
              />
              <rect
                x={centerX + 2}
                y={padTop + innerHeight - completedH}
                width={barW}
                height={Math.max(2, completedH)}
                rx={3}
                fill="#3B1D6E"
              />
              <text
                x={centerX}
                y={chartHeight - 14}
                textAnchor="middle"
                className="fill-[#1D1530] text-[11px] font-medium"
              >
                {label.dayName}
              </text>
              <text
                x={centerX}
                y={chartHeight - 2}
                textAnchor="middle"
                className="fill-[#5A4E73] text-[10px] font-mono tabular-nums"
              >
                {day.completed}/{day.planned}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
