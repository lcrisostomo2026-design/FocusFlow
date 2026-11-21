import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { CalendarPlus, LogOut, Maximize2, X } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { CompletionConfirmModal } from './components/CompletionConfirmModal';
import { DashboardView } from './components/DashboardView';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { PreferencesView } from './components/PreferencesView';
import { ProgressView } from './components/ProgressView';
import { ScheduleView } from './components/ScheduleView';
import { SessionModal } from './components/SessionModal';
import { SidebarNav } from './components/SidebarNav';
import {
  formatAuthError,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutUser,
  subscribeAuthState,
} from './config/firebase';
import { computeElapsedSeconds, useFocusTimer } from './hooks/useFocusTimer';
import type {
  AppNotification,
  EnergyLevel,
  FocusFlowStore,
  FocusSession,
  NavigationTab,
  UserPreferences,
} from './types/focusflow';
import { getTodayDateString } from './utils/dateTime';
import { computeFourWeekProgram } from './utils/programStats';
import {
  SESSION_DURATION_MINUTES,
  SESSION_DURATION_SECONDS,
  sortSessionsChronologically,
} from './utils/scheduleValidation';
import { playCompletionChime } from './utils/sound';
import {
  clearUserStore,
  createInitialStore,
  exportUserStoreJson,
  getDefaultTimerState,
  loadUserStore,
  saveUserStore,
} from './utils/storage';

const VIEW_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Today’s protected blocks and four-week progress',
  },
  schedule: {
    title: 'Schedule',
    subtitle: 'Plan two 90-minute deep-work sessions per day',
  },
  progress: {
    title: 'Progress',
    subtitle: 'Weekly 80% target tracking and session history',
  },
  preferences: {
    title: 'Preferences',
    subtitle: 'Program dates, energy defaults, and local storage',
  },
};

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [store, setStore] = useState<FocusFlowStore>(() => createInitialStore());
  const hydratedUidRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const [sessionModalOpen, setSessionModalOpen] = useState<boolean>(false);
  const [sessionModalDate, setSessionModalDate] = useState<string>(() => getTodayDateString());
  const [editingSession, setEditingSession] = useState<FocusSession | null>(null);

  const [pendingCompletionSession, setPendingCompletionSession] = useState<FocusSession | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const pushNotification = useCallback(
    (message: string, tone: AppNotification['tone'] = 'info', essential = false) => {
      if (isFocusMode && !essential) {
        return; // Mute non-essential in-app notifications during Focus Mode
      }
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setNotifications((prev) => [...prev.slice(-2), { id, message, tone, essential }]);
      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    [isFocusMode]
  );

  // Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const loaded = loadUserStore(firebaseUser.uid);
        hydratedUidRef.current = firebaseUser.uid;
        setStore(loaded);
      } else {
        hydratedUidRef.current = null;
        setStore(createInitialStore());
        setIsFocusMode(false);
        setSessionModalOpen(false);
        setEditingSession(null);
        setPendingCompletionSession(null);
        setActiveTab('dashboard');
        setNotifications([]);
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', '/');
        }
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Persist user data locally whenever store changes after hydration
  useEffect(() => {
    if (user && hydratedUidRef.current === user.uid) {
      saveUserStore(user.uid, store);
    }
  }, [user, store]);

  const handleNaturalComplete = useCallback(
    (sessionId: string, focusedSeconds: number) => {
      setStore((prev) => {
        const target = prev.sessions.find((s) => s.id === sessionId);
        if (!target || target.status !== 'scheduled') {
          return { ...prev, timer: getDefaultTimerState() };
        }
        if (prev.preferences.soundChimeEnabled) {
          playCompletionChime();
        }
        const now = Date.now();
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  status: 'completed',
                  completedAt: now,
                  updatedAt: now,
                  actualFocusedSeconds: focusedSeconds,
                }
              : s
          ),
          timer: getDefaultTimerState(),
        };
      });
      setIsFocusMode(false);
      pushNotification('90-minute focus session completed.', 'success', true);
    },
    [pushNotification]
  );

  const { elapsedSeconds, remainingSeconds, progressPercent } = useFocusTimer({
    timer: store.timer,
    onNaturalComplete: handleNaturalComplete,
  });

  const activeSession = useMemo(
    () =>
      store.timer.activeSessionId
        ? store.sessions.find(
            (s) => s.id === store.timer.activeSessionId && s.status === 'scheduled'
          ) || null
        : null,
    [store.sessions, store.timer.activeSessionId]
  );

  const todayStr = getTodayDateString();
  const todaySessions = useMemo(
    () => sortSessionsChronologically(store.sessions.filter((s) => s.date === todayStr)),
    [store.sessions, todayStr]
  );

  const program = useMemo(
    () =>
      computeFourWeekProgram(
        store.sessions,
        store.preferences.programStartDate,
        store.preferences.weeklyTargetPercent,
        todayStr
      ),
    [store.sessions, store.preferences.programStartDate, store.preferences.weeklyTargetPercent, todayStr]
  );

  const handleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOutUser();
      setUser(null);
      setIsFocusMode(false);
      setSessionModalOpen(false);
      setEditingSession(null);
      setPendingCompletionSession(null);
      setActiveTab('dashboard');
      setNotifications([]);
      setAuthError(null);
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }
    } catch {
      pushNotification('Unable to log out right now. Please try again.', 'error', true);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleOpenScheduleModal = (date?: string) => {
    setEditingSession(null);
    setSessionModalDate(date || todayStr);
    setSessionModalOpen(true);
  };

  const handleOpenRescheduleModal = (session: FocusSession) => {
    if (store.timer.activeSessionId === session.id && store.timer.status !== 'idle') {
      pushNotification(
        'Pause or complete the active timer before rescheduling this session.',
        'warning',
        true
      );
      return;
    }
    setEditingSession(session);
    setSessionModalDate(session.date);
    setSessionModalOpen(true);
  };

  const handleSaveSession = (data: {
    deliverable: string;
    date: string;
    startTime: string;
    energyLevel: EnergyLevel;
  }) => {
    const now = Date.now();
    if (editingSession) {
      setStore((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === editingSession.id
            ? {
                ...s,
                deliverable: data.deliverable,
                date: data.date,
                startTime: data.startTime,
                energyLevel: data.energyLevel,
                status: 'scheduled',
                interruptedAt: undefined,
                updatedAt: now,
              }
            : s
        ),
      }));
      pushNotification('Session rescheduled.', 'success');
    } else {
      const created: FocusSession = {
        id: generateSessionId(),
        deliverable: data.deliverable,
        date: data.date,
        startTime: data.startTime,
        durationMinutes: SESSION_DURATION_MINUTES,
        energyLevel: data.energyLevel,
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      };
      setStore((prev) => ({
        ...prev,
        sessions: [...prev.sessions, created],
      }));
      pushNotification('90-minute focus session scheduled.', 'success');
    }
  };

  const handleStartOrResume = (session: FocusSession) => {
    if (
      store.timer.activeSessionId &&
      store.timer.activeSessionId !== session.id &&
      store.timer.status !== 'idle'
    ) {
      pushNotification(
        'Another session is already in progress. Complete or mark it interrupted before starting a new one.',
        'warning',
        true
      );
      return;
    }

    const now = Date.now();
    setStore((prev) => {
      const resumingSame =
        prev.timer.activeSessionId === session.id && prev.timer.status === 'paused';
      return {
        ...prev,
        timer: {
          activeSessionId: session.id,
          status: 'running',
          startedAtMs: now,
          accumulatedMs: resumingSame ? prev.timer.accumulatedMs : 0,
          durationSeconds: SESSION_DURATION_SECONDS,
        },
      };
    });
  };

  const handlePauseTimer = () => {
    const now = Date.now();
    setStore((prev) => {
      if (prev.timer.status !== 'running' || prev.timer.startedAtMs === null) {
        return prev;
      }
      const delta = Math.max(0, now - prev.timer.startedAtMs);
      return {
        ...prev,
        timer: {
          ...prev.timer,
          status: 'paused',
          startedAtMs: null,
          accumulatedMs: prev.timer.accumulatedMs + delta,
        },
      };
    });
  };

  const completeSessionNow = (session: FocusSession, focusedSeconds: number) => {
    const now = Date.now();
    setStore((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === session.id
          ? {
              ...s,
              status: 'completed',
              completedAt: now,
              updatedAt: now,
              actualFocusedSeconds: focusedSeconds,
            }
          : s
      ),
      timer:
        prev.timer.activeSessionId === session.id ? getDefaultTimerState() : prev.timer,
    }));
    if (store.timer.activeSessionId === session.id) {
      setIsFocusMode(false);
    }
    pushNotification(`Completed: ${session.deliverable}`, 'success', true);
  };

  const interruptSessionNow = (session: FocusSession, focusedSeconds: number) => {
    const now = Date.now();
    setStore((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === session.id
          ? {
              ...s,
              status: 'interrupted',
              interruptedAt: now,
              updatedAt: now,
              actualFocusedSeconds: focusedSeconds,
            }
          : s
      ),
      timer:
        prev.timer.activeSessionId === session.id ? getDefaultTimerState() : prev.timer,
    }));
    if (store.timer.activeSessionId === session.id) {
      setIsFocusMode(false);
    }
    pushNotification(`Session logged as interrupted: ${session.deliverable}`, 'warning', true);
  };

  const handleRequestComplete = (session: FocusSession) => {
    const isCurrentTimer = store.timer.activeSessionId === session.id;
    const sessionRemaining = isCurrentTimer ? remainingSeconds : SESSION_DURATION_SECONDS;

    if (isCurrentTimer && sessionRemaining <= 0) {
      completeSessionNow(session, SESSION_DURATION_SECONDS);
      return;
    }

    // Pause active timer while confirming early completion so no seconds slip
    if (isCurrentTimer && store.timer.status === 'running') {
      handlePauseTimer();
    }
    setPendingCompletionSession(session);
  };

  const handleMarkInterrupted = (session: FocusSession) => {
    const isCurrentTimer = store.timer.activeSessionId === session.id;
    const focused = isCurrentTimer ? computeElapsedSeconds(store.timer) : 0;
    interruptSessionNow(session, focused);
  };

  const handleDeleteSession = (session: FocusSession) => {
    setStore((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== session.id),
      timer:
        prev.timer.activeSessionId === session.id ? getDefaultTimerState() : prev.timer,
    }));
    if (store.timer.activeSessionId === session.id) {
      setIsFocusMode(false);
    }
    pushNotification('Scheduled block removed.', 'info');
  };

  const handleEnterFocusMode = () => {
    if (activeSession) {
      setIsFocusMode(true);
      return;
    }
    const nextToday = todaySessions.find((s) => s.status === 'scheduled');
    if (nextToday) {
      handleStartOrResume(nextToday);
      setIsFocusMode(true);
      return;
    }
    pushNotification('Schedule a focus session first to enter Focus Mode.', 'info', true);
  };

  const handleUpdatePreferences = (nextPrefs: UserPreferences) => {
    setStore((prev) => ({
      ...prev,
      preferences: nextPrefs,
    }));
    pushNotification('Preferences saved locally.', 'success');
  };

  const handleClearAllData = () => {
    if (!user) return;
    clearUserStore(user.uid);
    setStore(createInitialStore());
    setIsFocusMode(false);
    pushNotification('All local productivity records cleared.', 'info', true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-xl border border-[#E4DCF2] bg-white p-6 text-center space-y-2">
          <p className="font-display text-lg font-semibold text-[#2E1065]">FocusFlow</p>
          <p className="text-xs text-[#5A4E73]">Checking authentication session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        isSigningIn={isSigningIn}
        errorMessage={authError}
        isConfigured={isFirebaseConfigured}
      />
    );
  }

  const headerInfo = VIEW_TITLES[activeTab];
  const pendingModalRemaining =
    pendingCompletionSession && store.timer.activeSessionId === pendingCompletionSession.id
      ? remainingSeconds
      : SESSION_DURATION_SECONDS;

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D1530] flex flex-col lg:flex-row">
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userDisplayName={user.displayName || 'FocusFlow User'}
        userEmail={user.email || ''}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <div className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0">
        {/* Top Bar Contract: Breadcrumb/View Title — Actions */}
        <header className="sticky top-0 z-20 border-b border-[#E4DCF2] bg-white/95 backdrop-blur-xs px-4 sm:px-8 py-3.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-[#1D1530] truncate">
                {headerInfo.title}
              </h1>
              <p className="hidden sm:block text-xs text-[#5A4E73] truncate">
                {headerInfo.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {activeSession && (
                <button
                  type="button"
                  onClick={() => setIsFocusMode(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-[#F3EEFA] px-3 py-2 text-xs font-medium text-[#2E1065] transition-colors hover:bg-[#EAE2F8] cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Focus Mode</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenScheduleModal(todayStr)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B1D6E] px-3 sm:px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2E1065] cursor-pointer whitespace-nowrap"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>
                  Schedule<span className="hidden sm:inline"> Block</span>
                </span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEEA] bg-white px-3 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isSigningOut ? 'Logging Out...' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                todaySessions={todaySessions}
                activeSession={activeSession}
                timer={store.timer}
                remainingSeconds={remainingSeconds}
                progressPercent={progressPercent}
                program={program}
                weeklyTargetPercent={store.preferences.weeklyTargetPercent}
                onStartOrResume={handleStartOrResume}
                onPause={handlePauseTimer}
                onRequestComplete={handleRequestComplete}
                onMarkInterrupted={handleMarkInterrupted}
                onReschedule={handleOpenRescheduleModal}
                onDelete={handleDeleteSession}
                onOpenScheduleModal={handleOpenScheduleModal}
                onEnterFocusMode={handleEnterFocusMode}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleView
                sessions={store.sessions}
                program={program}
                timer={store.timer}
                onOpenScheduleModal={handleOpenScheduleModal}
                onReschedule={handleOpenRescheduleModal}
                onStartOrResume={handleStartOrResume}
                onPause={handlePauseTimer}
                onRequestComplete={handleRequestComplete}
                onMarkInterrupted={handleMarkInterrupted}
                onDelete={handleDeleteSession}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                sessions={store.sessions}
                program={program}
                weeklyTargetPercent={store.preferences.weeklyTargetPercent}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesView
                preferences={store.preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onExportData={() => exportUserStoreJson(store)}
                onClearAllData={handleClearAllData}
              />
            )}
          </div>
        </main>
      </div>

      {/* In-App Notifications (muted when Focus Mode is active) */}
      {!isFocusMode && notifications.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-5 right-4 sm:right-6 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium shadow-md ${
                note.tone === 'error'
                  ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                  : note.tone === 'warning'
                  ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                  : note.tone === 'success'
                  ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                  : 'border-[#E4DCF2] bg-white text-[#1D1530]'
              }`}
            >
              <span>{note.message}</span>
              <button
                type="button"
                onClick={() =>
                  setNotifications((prev) => prev.filter((item) => item.id !== note.id))
                }
                aria-label="Dismiss notification"
                className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Focus Mode Fullscreen Overlay */}
      {isFocusMode && activeSession && (
        <FocusModeOverlay
          session={activeSession}
          timerStatus={store.timer.status}
          remainingSeconds={remainingSeconds}
          progressPercent={progressPercent}
          onStartOrResume={() => handleStartOrResume(activeSession)}
          onPause={handlePauseTimer}
          onRequestComplete={() => handleRequestComplete(activeSession)}
          onExitFocusMode={() => setIsFocusMode(false)}
        />
      )}

      {/* Schedule / Reschedule Session Modal */}
      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
          setEditingSession(null);
        }}
        onSave={handleSaveSession}
        initialDate={sessionModalDate}
        editingSession={editingSession}
        existingSessions={store.sessions}
        energyPresets={store.preferences.energyPresets}
      />

      {/* Explicit Early Completion Confirmation Modal */}
      <CompletionConfirmModal
        session={pendingCompletionSession}
        remainingSeconds={pendingModalRemaining}
        onConfirmComplete={() => {
          if (!pendingCompletionSession) return;
          const isCurrentTimer =
            store.timer.activeSessionId === pendingCompletionSession.id;
          const focused = isCurrentTimer ? elapsedSeconds : 0;
          completeSessionNow(pendingCompletionSession, focused);
          setPendingCompletionSession(null);
        }}
        onMarkInterrupted={() => {
          if (!pendingCompletionSession) return;
          const isCurrentTimer =
            store.timer.activeSessionId === pendingCompletionSession.id;
          const focused = isCurrentTimer ? elapsedSeconds : 0;
          interruptSessionNow(pendingCompletionSession, focused);
          setPendingCompletionSession(null);
        }}
        onKeepFocusing={() => {
          setPendingCompletionSession(null);
        }}
      />
    </div>
  );
}
