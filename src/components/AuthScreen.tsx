import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => Promise<void>;
  isSigningIn: boolean;
  errorMessage: string | null;
  isConfigured: boolean;
}

export function AuthScreen({
  onSignIn,
  isSigningIn,
  errorMessage,
  isConfigured,
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D1530] flex flex-col justify-between px-6 py-8 md:px-12">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <span className="font-display text-xl font-bold tracking-tight text-[#2E1065] whitespace-nowrap shrink-0">
          FocusFlow
        </span>
        <span className="text-xs font-medium text-[#5A4E73] whitespace-nowrap shrink-0">
          Deep-Work Time Blocking
        </span>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-sm font-medium text-[#5B21B6]">
            Four-Week Deep-Work Discipline
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1530] leading-[1.12] [text-wrap:balance]">
            Protect two 90-minute focus blocks every day.
          </h1>
          <p className="text-base sm:text-lg text-[#5A4E73] leading-relaxed max-w-xl">
            Schedule only your two highest-priority deliverables each day, execute with an
            accurate 90-minute countdown timer, and maintain an 80% weekly completion rhythm
            across four calendar weeks.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#E4DCF2]">
            <div>
              <p className="font-display text-sm font-semibold text-[#1D1530]">
                2 × 90 Min Daily
              </p>
              <p className="mt-1 text-xs text-[#5A4E73] leading-relaxed">
                Non-overlapping blocks aligned to your energy levels without overfilling your calendar.
              </p>
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-[#1D1530]">
                80% Weekly Target
              </p>
              <p className="mt-1 text-xs text-[#5A4E73] leading-relaxed">
                Track planned versus completed sessions across four consecutive calendar weeks.
              </p>
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-[#1D1530]">
                Local-First Privacy
              </p>
              <p className="mt-1 text-xs text-[#5A4E73] leading-relaxed">
                Google Auth verifies your session while schedules and logs stay on your device.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E4DCF2] rounded-xl p-8 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-[#1D1530]">
              Sign in to FocusFlow
            </h2>
            <p className="mt-2 text-sm text-[#5A4E73] leading-relaxed">
              Use your Google account to open your personal workspace. No password setup or
              extra profile forms required.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-xs text-[#991B1B]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onSignIn}
              disabled={isSigningIn || !isConfigured}
              className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-lg bg-[#3B1D6E] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2E1065] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#FFFFFF"
                  d="M21.35 11.1H12v2.98h5.37c-.23 1.5-1.76 4.4-5.37 4.4-3.23 0-5.87-2.68-5.87-5.98s2.64-5.98 5.87-5.98c1.84 0 3.07.79 3.77 1.46l2.57-2.48C16.7 3.97 14.56 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.65-3.66 8.65-8.82 0-.59-.06-1.05-.15-1.58z"
                />
              </svg>
              <span>{isSigningIn ? 'Signing in with Google...' : 'Continue with Google'}</span>
              {!isSigningIn && <ArrowRight className="h-4 w-4 shrink-0" />}
            </button>

            <div className="mt-6 pt-5 border-t border-[#EAE2F8] flex items-start gap-2.5 text-xs text-[#5A4E73]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#5B21B6] mt-0.5" />
              <span>
                Firebase Authentication manages sign-in only. Your tasks, schedules, and timer
                history remain stored locally in this browser.
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-[#EAE2F8] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A4E73]">
        <span>FocusFlow Personal Productivity</span>
        <span>Two 90-minute blocks · Four-week cadence</span>
      </footer>
    </div>
  );
}
