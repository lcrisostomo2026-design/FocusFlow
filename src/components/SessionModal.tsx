import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { EnergyLevel, EnergyPresets, FocusSession } from '../types/focusflow';
import { formatShortDate, formatTimeRange } from '../utils/dateTime';
import {
  MAX_SESSIONS_PER_DAY,
  SESSION_DURATION_MINUTES,
  validateSessionInput,
} from '../utils/scheduleValidation';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    deliverable: string;
    date: string;
    startTime: string;
    energyLevel: EnergyLevel;
  }) => void;
  initialDate: string;
  editingSession: FocusSession | null;
  existingSessions: FocusSession[];
  energyPresets: EnergyPresets;
}

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; hint: string }[] = [
  { value: 'peak', label: 'Peak Focus', hint: 'Highest cognitive demand' },
  { value: 'steady', label: 'Steady Flow', hint: 'Sustained execution' },
  { value: 'low-load', label: 'Low-Load Deep Work', hint: 'Synthesis & review' },
];

export function SessionModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingSession,
  existingSessions,
  energyPresets,
}: SessionModalProps) {
  const [deliverable, setDeliverable] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(energyPresets.peak);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('peak');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (editingSession) {
      setDeliverable(editingSession.deliverable);
      setDate(editingSession.date);
      setStartTime(editingSession.startTime);
      setEnergyLevel(editingSession.energyLevel);
    } else {
      setDeliverable('');
      setDate(initialDate);
      const daySessions = existingSessions.filter((s) => s.date === initialDate);
      if (daySessions.length === 1) {
        setEnergyLevel('steady');
        setStartTime(energyPresets.steady);
      } else {
        setEnergyLevel('peak');
        setStartTime(energyPresets.peak);
      }
    }
    setError(null);
  }, [isOpen, editingSession, initialDate, existingSessions, energyPresets]);

  if (!isOpen) {
    return null;
  }

  const sameDayExisting = existingSessions.filter(
    (s) => s.date === date && s.id !== editingSession?.id
  );
  const slotsRemaining = Math.max(0, MAX_SESSIONS_PER_DAY - sameDayExisting.length);

  const handleEnergySelect = (level: EnergyLevel) => {
    setEnergyLevel(level);
    if (!editingSession) {
      if (level === 'peak') setStartTime(energyPresets.peak);
      if (level === 'steady') setStartTime(energyPresets.steady);
      if (level === 'low-load') setStartTime(energyPresets.lowLoad);
    }
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateSessionInput({
      deliverable,
      date,
      startTime,
      existingSessions,
      editingSessionId: editingSession?.id,
    });

    if (!validation.valid) {
      setError(validation.error || 'Please check your session details.');
      return;
    }

    onSave({
      deliverable: deliverable.trim(),
      date,
      startTime,
      energyLevel,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1530]/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E4DCF2] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EAE2F8] px-6 py-4">
          <div>
            <h2 id="session-modal-title" className="font-display text-lg font-semibold text-[#1D1530]">
              {editingSession ? 'Reschedule Deep-Work Session' : 'Schedule 90-Minute Session'}
            </h2>
            <p className="mt-0.5 text-xs text-[#5A4E73]">
              {formatShortDate(date)} · {slotsRemaining} of {MAX_SESSIONS_PER_DAY} daily blocks available
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-[#5A4E73] transition-colors hover:bg-[#F3EEFA] hover:text-[#1D1530] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="session-deliverable"
              className="block text-xs font-semibold text-[#1D1530]"
            >
              Core Deliverable
            </label>
            <input
              id="session-deliverable"
              type="text"
              value={deliverable}
              onChange={(e) => {
                setDeliverable(e.target.value);
                if (error) setError(null);
              }}
              maxLength={140}
              placeholder="e.g., Draft Q4 architecture specification"
              className="mt-1.5 w-full rounded-lg border border-[#D8CEEA] bg-white px-3.5 py-2.5 text-sm text-[#1D1530] placeholder:text-[#8E82A8] focus:border-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
              autoFocus
            />
            <p className="mt-1 text-xs text-[#5A4E73]">
              Define one concrete output you will complete during this {SESSION_DURATION_MINUTES}-minute block.
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1D1530]">
              Energy Alignment
            </span>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ENERGY_OPTIONS.map((opt) => {
                const selected = energyLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleEnergySelect(opt.value)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#4C1D95] bg-[#F3EEFA] text-[#2E1065]'
                        : 'border-[#E4DCF2] bg-white text-[#1D1530] hover:bg-[#FAF8FF]'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{opt.label}</span>
                    <span className="mt-0.5 block text-[11px] text-[#5A4E73]">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="session-date" className="block text-xs font-semibold text-[#1D1530]">
                Date
              </label>
              <input
                id="session-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-1.5 w-full rounded-lg border border-[#D8CEEA] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
              />
            </div>

            <div>
              <label htmlFor="session-start-time" className="block text-xs font-semibold text-[#1D1530]">
                Start Time (90 min fixed)
              </label>
              <input
                id="session-start-time"
                type="time"
                value={startTime}
                max="22:30"
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-1.5 w-full rounded-lg border border-[#D8CEEA] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
              />
              <p className="mt-1 font-mono text-xs tabular-nums text-[#5A4E73]">
                Window: {startTime ? formatTimeRange(startTime) : 'Select time'}
              </p>
            </div>
          </div>

          {sameDayExisting.length > 0 && (
            <div className="rounded-lg border border-[#EAE2F8] bg-[#FAF8FF] px-3.5 py-2.5 text-xs text-[#5A4E73]">
              <span className="font-medium text-[#1D1530]">Already scheduled on {formatShortDate(date)}: </span>
              {sameDayExisting.map((s) => `${s.deliverable} (${formatTimeRange(s.startTime)})`).join(' · ')}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-[#EAE2F8] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D8CEEA] bg-white px-4 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#3B1D6E] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] cursor-pointer whitespace-nowrap"
            >
              {editingSession ? 'Save Reschedule' : 'Schedule 90m Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
