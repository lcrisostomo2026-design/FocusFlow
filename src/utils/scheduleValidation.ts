import type { FocusSession } from '../types/focusflow';
import { formatTimeRange, isValidDateString, timeToMinutes } from './dateTime';

export const SESSION_DURATION_MINUTES = 90;
export const SESSION_DURATION_SECONDS = 90 * 60;
export const MAX_SESSIONS_PER_DAY = 2;
export const MAX_START_MINUTES = 22 * 60 + 30; // 22:30 so 90m finishes by 24:00

export interface SessionValidationInput {
  deliverable: string;
  date: string;
  startTime: string;
  existingSessions: FocusSession[];
  editingSessionId?: string | null;
}

export interface SessionValidationResult {
  valid: boolean;
  error?: string;
}

export function isValidTimeString(hhmm: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hhmm);
}

export function validateSessionInput({
  deliverable,
  date,
  startTime,
  existingSessions,
  editingSessionId,
}: SessionValidationInput): SessionValidationResult {
  const trimmed = deliverable.trim();
  if (trimmed.length < 3) {
    return {
      valid: false,
      error: 'Enter a specific core deliverable (at least 3 characters).',
    };
  }
  if (trimmed.length > 140) {
    return {
      valid: false,
      error: 'Core deliverable must be 140 characters or fewer.',
    };
  }

  if (!isValidDateString(date)) {
    return {
      valid: false,
      error: 'Select a valid calendar date.',
    };
  }

  if (!isValidTimeString(startTime)) {
    return {
      valid: false,
      error: 'Select a valid start time.',
    };
  }

  const startMins = timeToMinutes(startTime);
  if (startMins > MAX_START_MINUTES) {
    return {
      valid: false,
      error: 'A 90-minute session must start by 10:30 PM (22:30) to finish within the same day.',
    };
  }
  const endMins = startMins + SESSION_DURATION_MINUTES;

  const sameDaySessions = existingSessions.filter(
    (s) => s.date === date && s.id !== editingSessionId
  );

  if (sameDaySessions.length >= MAX_SESSIONS_PER_DAY) {
    return {
      valid: false,
      error: `Daily limit reached: FocusFlow protects exactly ${MAX_SESSIONS_PER_DAY} deep-work sessions per day.`,
    };
  }

  const conflicting = sameDaySessions.find((existing) => {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = existingStart + existing.durationMinutes;
    return startMins < existingEnd && existingStart < endMins;
  });

  if (conflicting) {
    return {
      valid: false,
      error: `Overlaps with "${conflicting.deliverable}" (${formatTimeRange(conflicting.startTime)}). Choose a non-overlapping time.`,
    };
  }

  return { valid: true };
}

export function sortSessionsChronologically(sessions: FocusSession[]): FocusSession[] {
  return [...sessions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
}
