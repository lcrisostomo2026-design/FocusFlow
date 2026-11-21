import { AlertTriangle } from 'lucide-react';
import type { FocusSession } from '../types/focusflow';
import { formatCountdown } from '../utils/dateTime';

interface CompletionConfirmModalProps {
  session: FocusSession | null;
  remainingSeconds: number;
  onConfirmComplete: () => void;
  onMarkInterrupted: () => void;
  onKeepFocusing: () => void;
}

export function CompletionConfirmModal({
  session,
  remainingSeconds,
  onConfirmComplete,
  onMarkInterrupted,
  onKeepFocusing,
}: CompletionConfirmModalProps) {
  if (!session) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-[#1D1530]/55 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-complete-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[#E4DCF2] bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#FEF3C7] p-2 text-[#B45309] shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 id="confirm-complete-title" className="font-display text-base font-semibold text-[#1D1530]">
              90-Minute Timer Still Has Time Remaining
            </h2>
            <p className="mt-1.5 text-sm text-[#5A4E73] leading-relaxed">
              <span className="font-mono font-semibold tabular-nums text-[#2E1065]">
                {formatCountdown(remainingSeconds)}
              </span>{' '}
              remains on <span className="font-medium text-[#1D1530]">"{session.deliverable}"</span>.
              Confirm completion only if the core deliverable is genuinely finished, or log the
              session as interrupted.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-2.5">
          <button
            type="button"
            onClick={onConfirmComplete}
            className="rounded-lg bg-[#3B1D6E] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] cursor-pointer whitespace-nowrap"
          >
            Confirm Early Completion
          </button>
          <button
            type="button"
            onClick={onMarkInterrupted}
            className="rounded-lg border border-[#F59E0B] bg-[#FFFBEB] px-4 py-2.5 text-xs font-medium text-[#92400E] transition-colors hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap"
          >
            Log as Interrupted
          </button>
          <button
            type="button"
            onClick={onKeepFocusing}
            className="rounded-lg border border-[#D8CEEA] bg-white px-4 py-2.5 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
          >
            Resume Timer
          </button>
        </div>
      </div>
    </div>
  );
}
