import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import type { NavigationTab } from '../types/focusflow';

interface SidebarNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userDisplayName: string;
  userEmail: string;
  onSignOut: () => Promise<void>;
  isSigningOut?: boolean;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export function SidebarNav({
  activeTab,
  onSelectTab,
  userDisplayName,
  userEmail,
  onSignOut,
  isSigningOut = false,
}: SidebarNavProps) {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between border-r border-[#E4DCF2] bg-white px-4 py-6">
        <div className="space-y-8">
          <div className="px-2">
            <span className="font-display text-xl font-bold tracking-tight text-[#2E1065] whitespace-nowrap">
              FocusFlow
            </span>
          </div>

          <nav aria-label="Primary navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F3EEFA] text-[#2E1065]'
                      : 'text-[#5A4E73] hover:bg-[#FAF8FF] hover:text-[#1D1530]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#4C1D95]' : 'text-[#7B6E94]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#EAE2F8] pt-4 px-2 space-y-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#1D1530]">
              {userDisplayName || 'Google Account'}
            </p>
            <p className="truncate text-[11px] text-[#5A4E73]">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8CEEA] bg-white px-3 py-2 text-xs font-medium text-[#1D1530] transition-colors hover:bg-[#FAF8FF] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isSigningOut ? 'Logging Out...' : 'Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile & Tablet Compact Bottom Navigation (<= 15% viewport height) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#E4DCF2] bg-white px-2 py-1.5"
      >
        <div className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors cursor-pointer ${
                  isActive ? 'bg-[#F3EEFA] text-[#2E1065]' : 'text-[#5A4E73]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
