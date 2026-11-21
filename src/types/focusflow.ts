export type EnergyLevel = 'peak' | 'steady' | 'low-load';

export type SessionStatus = 'scheduled' | 'completed' | 'interrupted';

export type TimerStatus = 'idle' | 'running' | 'paused';

export type NavigationTab = 'dashboard' | 'schedule' | 'progress' | 'preferences';

export interface FocusSession {
  id: string;
  deliverable: string;
  date: string; // YYYY-MM-DD (local calendar date)
  startTime: string; // HH:MM (24-hour, <= 22:30)
  durationMinutes: 90;
  energyLevel: EnergyLevel;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  interruptedAt?: number;
  actualFocusedSeconds?: number;
}

export interface TimerState {
  activeSessionId: string | null;
  status: TimerStatus;
  startedAtMs: number | null;
  accumulatedMs: number;
  durationSeconds: number; // Always 5400 (90 minutes)
}

export interface EnergyPresets {
  peak: string;
  steady: string;
  lowLoad: string;
}

export interface UserPreferences {
  programStartDate: string; // YYYY-MM-DD normalized to a Monday
  weeklyTargetPercent: number; // >= 80
  soundChimeEnabled: boolean;
  energyPresets: EnergyPresets;
}

export interface FocusFlowStore {
  version: 1;
  sessions: FocusSession[];
  timer: TimerState;
  preferences: UserPreferences;
}

export interface AppNotification {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'error';
  essential?: boolean;
}
