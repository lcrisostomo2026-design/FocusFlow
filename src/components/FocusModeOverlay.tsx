import { BellOff, CheckCircle2, Minimize2, Pause, Play } from 'lucide-react';
import type { FocusSession, TimerStatus } from '../types/focusflow';
import { formatCountdown, formatTimeRange } from '../utils/dateTime';

interface FocusModeOverlayProps {
  session: FocusSession;
  timerStatus: TimerStatus;
  remainingSeconds: number;
  progressPercent: number;
  onStartOrResume: () => void;
  onPause: () => void;
  onRequestComplete: () => void;
  onExitFocusMode: () => void;
}

export function FocusModeOverlay({
  session,
  timerStatus,
  remainingSeconds,
  progressPercent,
  onStartOrResume,
  onPause,
  onRequestComplete,
  onExitFocusMode,
}: FocusModeOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#1D0F3A] text-white px-6 py-6 md:px-12 md:py-8 overflow-y-auto">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4">
        <span className="font-display text-base font-semibold tracking-tight text-[#DDD6FE] whitespace-nowrap shrink-0">
          FocusFlow · Focus Mode
        </span>
        <button
          type="button"
          onClick={onExitFocusMode}
          className="inline-flex items-center gap-2 rounded-lg border border-[#4C3575] bg-[#2B1754] px-3.5 py-2 text-xs font-medium text-[#EDE9FE] transition-colors hover:bg-[#3A216E] cursor-pointer whitespace-nowrap shrink-0"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          <span>Exit Focus Mode</span>
        </button>
      </header>

      <main className="max-w-2xl w-full mx-auto my-auto py-10 flex flex-col items-center text-center">
        <p className="text-xs font-medium text-[#C4B5FD]">
          {formatTimeRange(session.startTime)} · 90-Minute Deep Work
        </p>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-white leading-snug [text-wrap:balance]">
          {session.deliverable}
        </h1>

        <div className="mt-10 mb-8 w-full max-w-md">
          <div
            aria-live="polite"
            className="font-mono text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums text-white"
          >
            {formatCountdown(remainingSeconds)}
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#311B5C]">
            <div
              className="h-full rounded-full bg-[#A78BFA] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2.5 font-mono text-xs tabular-nums text-[#C4B5FD]">
            {Math.round(progressPercent)}% elapsed · {timerStatus === 'running' ? 'Running' : timerStatus === 'paused' ? 'Paused' : 'Ready to start'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {timerStatus === 'running' ? (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1D0F3A] transition-colors hover:bg-[#EDE9FE] cursor-pointer whitespace-nowrap"
            >
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartOrResume}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1D0F3A] transition-colors hover:bg-[#EDE9FE] cursor-pointer whitespace-nowrap"
            >
              <Play className="h-4 w-4" />
              <span>{timerStatus === 'paused' ? 'Resume' : 'Start Session'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRequestComplete}
            className="inline-flex items-center gap-2 rounded-lg border border-[#5B418F] bg-[#2B1754] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3A216E] cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete</span>
          </button>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto pt-4 border-t border-[#311B5C] flex items-center justify-center gap-2 text-xs text-[#C4B5FD] text-center">
        <BellOff className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]" />
        <span>
          In-app notifications are muted during Focus Mode. Device and OS alerts remain managed by your browser or operating system.
        </span>
      </footer>
    </div>
  );
}
