import { useEffect, useRef, useState } from 'react';
import type { TimerState } from '../types/focusflow';
import { SESSION_DURATION_SECONDS } from '../utils/scheduleValidation';

export function computeElapsedSeconds(timer: TimerState, nowMs: number = Date.now()): number {
  if (timer.status === 'idle') {
    return 0;
  }
  const runningDelta =
    timer.status === 'running' && timer.startedAtMs !== null
      ? Math.max(0, nowMs - timer.startedAtMs)
      : 0;
  const totalMs = timer.accumulatedMs + runningDelta;
  return Math.min(timer.durationSeconds, Math.floor(totalMs / 1000));
}

interface UseFocusTimerOptions {
  timer: TimerState;
  onNaturalComplete: (sessionId: string, focusedSeconds: number) => void;
}

export function useFocusTimer({ timer, onNaturalComplete }: UseFocusTimerOptions) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const completedFiredForRef = useRef<string | null>(null);

  useEffect(() => {
    if (timer.status !== 'running') {
      completedFiredForRef.current = null;
      setNowMs(Date.now());
      return;
    }

    setNowMs(Date.now());
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [timer.status, timer.startedAtMs, timer.activeSessionId]);

  const elapsedSeconds = computeElapsedSeconds(timer, nowMs);
  const remainingSeconds = Math.max(0, SESSION_DURATION_SECONDS - elapsedSeconds);
  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedSeconds / SESSION_DURATION_SECONDS) * 100)
  );

  useEffect(() => {
    if (
      timer.status === 'running' &&
      timer.activeSessionId &&
      remainingSeconds <= 0 &&
      completedFiredForRef.current !== timer.activeSessionId
    ) {
      completedFiredForRef.current = timer.activeSessionId;
      onNaturalComplete(timer.activeSessionId, SESSION_DURATION_SECONDS);
    }
  }, [timer.status, timer.activeSessionId, remainingSeconds, onNaturalComplete]);

  return {
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
  };
}
