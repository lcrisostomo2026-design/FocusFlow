import { CalendarClock, CheckCircle2, Pause, Play, Trash2, XCircle } from 'lucide-react';
import type { EnergyLevel, FocusSession, TimerStatus } from '../types/focusflow';
import { formatTimeRange } from '../utils/dateTime';

interface SessionRowProps {
  session: FocusSession;
  isActiveTimerSession: boolean;
  timerStatus: TimerStatus;
  onStartOrResume: (session: FocusSession) => void;
  onPause: () => void;
  onReschedule: (session: FocusSession) => void;
  onRequestComplete: (session: FocusSession) => void;
  onMarkInterrupted: (session: FocusSession) => void;
  onDelete: (session: FocusSession) => void;
}

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  peak: 'Peak Focus',
  steady: 'Steady Flow',
  'low-load': 'Low-Load Deep Work',
};

const STATUS_LABELS: Record<FocusSession['status'], { text: string; className: string }> = {
  scheduled: { text: 'Scheduled', className: 'text-[#5B21B6]' },
  completed: { text: 'Completed', className: 'text-[#15803D]' },
  interrupted: { text: 'Interrupted', className: 'text-[#B45309]' },
};

export function SessionRow({
  session,
  isActiveTimerSession,
  timerStatus,
  onStartOrResume,
  onPause,
  onReschedule,
  onRequestComplete,
  onMarkInterrupted,
  onDelete,
}: SessionRowProps) {
  const statusInfo = STATUS_LABELS[session.status];
  const isRunning = isActiveTimerSession && timerStatus === 'running';
  const isPaused = isActiveTimerSession && timerStatus === 'paused';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 space-y-1">
        <p className="font-display text-sm font-semibold text-[#1D1530] truncate">
          {session.deliverable}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A4E73]">
          <span className="font-mono tabular-nums text-[#1D1530]">
            {formatTimeRange(session.startTime)}
          </span>
          <span aria-hidden="true">·</span>
          <span>90 min</span>
          <span aria-hidden="true">·</span>
          <span>{ENERGY_LABELS[session.energyLevel]}</span>
          <span aria-hidden="true">·</span>
          <span className={`font-medium ${statusInfo.className}`}>
            {isRunning ? 'In Progress' : isPaused ? 'Paused' : statusInfo.text}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {session.status === 'scheduled' && (
          <>
            {isRunning ? (
              <button
                type="button"
                onClick={onPause}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-3 py-1.5 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartOrResume(session)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B1D6E] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] cursor-pointer whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isPaused ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRequestComplete(session)}
              title="Complete session"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-3 py-1.5 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#F3EEFA] cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D]" />
              <span>Complete</span>
            </button>

            <button
              type="button"
              onClick={() => onReschedule(session)}
              title="Reschedule session"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-3 py-1.5 text-xs font-medium text-[#5A4E73] transition-colors hover:bg-[#FAF8FF] hover:text-[#1D1530] cursor-pointer whitespace-nowrap"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Reschedule</span>
            </button>

            <button
              type="button"
              onClick={() => onMarkInterrupted(session)}
              title="Mark interrupted"
              className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-[#5A4E73] transition-colors hover:bg-[#FFFBEB] hover:text-[#B45309] cursor-pointer whitespace-nowrap"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Interrupt</span>
            </button>
          </>
        )}

        {session.status === 'interrupted' && (
          <button
            type="button"
            onClick={() => onReschedule(session)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-3 py-1.5 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Reschedule</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(session)}
          aria-label={`Remove ${session.deliverable}`}
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#7B6E94] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
