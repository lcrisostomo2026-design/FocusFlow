import type { FocusFlowStore, FocusSession, TimerState, UserPreferences } from '../types/focusflow';
import { getMondayOfWeek, getTodayDateString, isValidDateString } from './dateTime';
import { SESSION_DURATION_SECONDS } from './scheduleValidation';

const STORAGE_PREFIX = 'focusflow_v1_';

export function getDefaultTimerState(): TimerState {
  return {
    activeSessionId: null,
    status: 'idle',
    startedAtMs: null,
    accumulatedMs: 0,
    durationSeconds: SESSION_DURATION_SECONDS,
  };
}

export function getDefaultPreferences(): UserPreferences {
  return {
    programStartDate: getMondayOfWeek(getTodayDateString()),
    weeklyTargetPercent: 80,
    soundChimeEnabled: true,
    energyPresets: {
      peak: '09:00',
      steady: '13:30',
      lowLoad: '16:00',
    },
  };
}

export function createInitialStore(): FocusFlowStore {
  return {
    version: 1,
    sessions: [],
    timer: getDefaultTimerState(),
    preferences: getDefaultPreferences(),
  };
}

function getStorageKey(uid: string): string {
  return `${STORAGE_PREFIX}${uid}`;
}

export function loadUserStore(uid: string): FocusFlowStore {
  const defaults = createInitialStore();
  try {
    const raw = window.localStorage.getItem(getStorageKey(uid));
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<FocusFlowStore>;
    if (!parsed || typeof parsed !== 'object') {
      return defaults;
    }

    const sessions: FocusSession[] = Array.isArray(parsed.sessions)
      ? parsed.sessions.filter(
          (s): s is FocusSession =>
            Boolean(s) &&
            typeof s.id === 'string' &&
            typeof s.deliverable === 'string' &&
            typeof s.date === 'string' &&
            typeof s.startTime === 'string'
        )
      : [];

    const rawPrefs = parsed.preferences;
    const defaultPrefs = getDefaultPreferences();
    const programStartDate =
      rawPrefs && typeof rawPrefs.programStartDate === 'string' && isValidDateString(rawPrefs.programStartDate)
        ? getMondayOfWeek(rawPrefs.programStartDate)
        : defaultPrefs.programStartDate;

    const weeklyTargetPercent =
      rawPrefs && typeof rawPrefs.weeklyTargetPercent === 'number'
        ? Math.min(100, Math.max(80, Math.round(rawPrefs.weeklyTargetPercent)))
        : 80;

    const preferences: UserPreferences = {
      programStartDate,
      weeklyTargetPercent,
      soundChimeEnabled:
        rawPrefs && typeof rawPrefs.soundChimeEnabled === 'boolean'
          ? rawPrefs.soundChimeEnabled
          : defaultPrefs.soundChimeEnabled,
      energyPresets: {
        peak: rawPrefs?.energyPresets?.peak || defaultPrefs.energyPresets.peak,
        steady: rawPrefs?.energyPresets?.steady || defaultPrefs.energyPresets.steady,
        lowLoad: rawPrefs?.energyPresets?.lowLoad || defaultPrefs.energyPresets.lowLoad,
      },
    };

    const rawTimer = parsed.timer;
    const validActiveSession =
      rawTimer?.activeSessionId &&
      sessions.some((s) => s.id === rawTimer.activeSessionId && s.status === 'scheduled');

    const timer: TimerState = validActiveSession && rawTimer
      ? {
          activeSessionId: rawTimer.activeSessionId,
          status:
            rawTimer.status === 'running' || rawTimer.status === 'paused' ? rawTimer.status : 'idle',
          startedAtMs: typeof rawTimer.startedAtMs === 'number' ? rawTimer.startedAtMs : null,
          accumulatedMs: typeof rawTimer.accumulatedMs === 'number' ? Math.max(0, rawTimer.accumulatedMs) : 0,
          durationSeconds: SESSION_DURATION_SECONDS,
        }
      : getDefaultTimerState();

    return {
      version: 1,
      sessions,
      timer,
      preferences,
    };
  } catch {
    return defaults;
  }
}

export function saveUserStore(uid: string, store: FocusFlowStore): boolean {
  try {
    window.localStorage.setItem(getStorageKey(uid), JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function clearUserStore(uid: string): void {
  try {
    window.localStorage.removeItem(getStorageKey(uid));
  } catch {
    // Ignore storage removal errors
  }
}

export function exportUserStoreJson(store: FocusFlowStore): void {
  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      application: 'FocusFlow',
      ...store,
    },
    null,
    2
  );
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `focusflow-backup-${getTodayDateString()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
