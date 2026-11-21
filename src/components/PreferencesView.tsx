import { useState, type FormEvent } from 'react';
import { Download, RotateCcw, Shield, Trash2 } from 'lucide-react';
import type { UserPreferences } from '../types/focusflow';
import { getMondayOfWeek, getTodayDateString, isValidDateString } from '../utils/dateTime';

interface PreferencesViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (next: UserPreferences) => void;
  onExportData: () => void;
  onClearAllData: () => void;
}

export function PreferencesView({
  preferences,
  onUpdatePreferences,
  onExportData,
  onClearAllData,
}: PreferencesViewProps) {
  const [programStartDate, setProgramStartDate] = useState(preferences.programStartDate);
  const [weeklyTargetPercent, setWeeklyTargetPercent] = useState(preferences.weeklyTargetPercent);
  const [peakTime, setPeakTime] = useState(preferences.energyPresets.peak);
  const [steadyTime, setSteadyTime] = useState(preferences.energyPresets.steady);
  const [lowLoadTime, setLowLoadTime] = useState(preferences.energyPresets.lowLoad);
  const [soundChimeEnabled, setSoundChimeEnabled] = useState(preferences.soundChimeEnabled);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const normalizedMonday = isValidDateString(programStartDate)
      ? getMondayOfWeek(programStartDate)
      : preferences.programStartDate;
    setProgramStartDate(normalizedMonday);

    onUpdatePreferences({
      programStartDate: normalizedMonday,
      weeklyTargetPercent: Math.min(100, Math.max(80, weeklyTargetPercent)),
      soundChimeEnabled,
      energyPresets: {
        peak: peakTime || '09:00',
        steady: steadyTime || '13:30',
        lowLoad: lowLoadTime || '16:00',
      },
    });
  };

  const handleStartFreshCycle = () => {
    const thisMonday = getMondayOfWeek(getTodayDateString());
    setProgramStartDate(thisMonday);
    onUpdatePreferences({
      ...preferences,
      programStartDate: thisMonday,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSave} className="rounded-xl border border-[#E4DCF2] bg-white p-6 space-y-6">
        <div className="pb-4 border-b border-[#EAE2F8]">
          <h2 className="font-display text-lg font-semibold text-[#1D1530]">
            Program & Energy Preferences
          </h2>
          <p className="mt-1 text-xs text-[#5A4E73]">
            Configure your four-calendar-week tracking period, completion target, and preferred
            deep-work start times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="pref-program-start" className="block text-xs font-semibold text-[#1D1530]">
              4-Week Program Start (Normalized to Monday)
            </label>
            <input
              id="pref-program-start"
              type="date"
              value={programStartDate}
              onChange={(e) => setProgramStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D8CEEA] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
            />
            <button
              type="button"
              onClick={handleStartFreshCycle}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#5B21B6] hover:text-[#2E1065] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Set to Current Week&apos;s Monday</span>
            </button>
          </div>

          <div>
            <label htmlFor="pref-weekly-target" className="block text-xs font-semibold text-[#1D1530]">
              Weekly Completion Target (Minimum 80%)
            </label>
            <input
              id="pref-weekly-target"
              type="number"
              min={80}
              max={100}
              value={weeklyTargetPercent}
              onChange={(e) => setWeeklyTargetPercent(Math.min(100, Math.max(80, Number(e.target.value) || 80)))}
              className="mt-1.5 w-full rounded-lg border border-[#D8CEEA] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
            />
            <p className="mt-1 text-xs text-[#5A4E73]">
              FocusFlow enforces a minimum 80% weekly completion benchmark.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE2F8] space-y-3">
          <h3 className="font-display text-sm font-semibold text-[#1D1530]">
            Default Start Times by Energy Level
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pref-peak" className="block text-xs font-medium text-[#5A4E73]">
                Peak Focus
              </label>
              <input
                id="pref-peak"
                type="time"
                max="22:30"
                value={peakTime}
                onChange={(e) => setPeakTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D8CEEA] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="pref-steady" className="block text-xs font-medium text-[#5A4E73]">
                Steady Flow
              </label>
              <input
                id="pref-steady"
                type="time"
                max="22:30"
                value={steadyTime}
                onChange={(e) => setSteadyTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D8CEEA] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="pref-lowload" className="block text-xs font-medium text-[#5A4E73]">
                Low-Load Deep Work
              </label>
              <input
                id="pref-lowload"
                type="time"
                max="22:30"
                value={lowLoadTime}
                onChange={(e) => setLowLoadTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D8CEEA] bg-white px-3 py-2 font-mono text-sm tabular-nums text-[#1D1530] focus:border-[#4C1D95] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE2F8] flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#1D1530]">Session Completion Chime</p>
            <p className="text-xs text-[#5A4E73]">
              Play a subtle in-app harmonic chime when the 90-minute countdown reaches 00:00.
            </p>
          </div>
          <input
            type="checkbox"
            checked={soundChimeEnabled}
            onChange={(e) => setSoundChimeEnabled(e.target.checked)}
            aria-label="Enable completion chime"
            className="h-4 w-4 accent-[#3B1D6E] cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-[#EAE2F8] flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-[#3B1D6E] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] cursor-pointer whitespace-nowrap"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Local-Only Data & Privacy Controls */}
      <section className="rounded-xl border border-[#E4DCF2] bg-white p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#5B21B6] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-base font-semibold text-[#1D1530]">
              Local Device Storage
            </h3>
            <p className="mt-1 text-xs text-[#5A4E73] leading-relaxed">
              Your schedules, core deliverables, timer state, and four-week completion records are
              stored exclusively in this browser&apos;s localStorage. No productivity data is sent
              to an external database.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportData}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8CEEA] bg-white px-4 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON Backup</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-2 text-xs font-medium text-[#991B1B] transition-colors hover:bg-[#FEE2E2] cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Local Data</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#991B1B]">
                Delete all local sessions?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#B91C1C] cursor-pointer whitespace-nowrap"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-[#D8CEEA] bg-white px-3 py-1.5 text-xs font-medium text-[#1D1530] hover:bg-[#FAF8FF] cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
