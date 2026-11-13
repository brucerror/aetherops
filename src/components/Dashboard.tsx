import { useState } from 'react';
import { KpiIslands } from './KpiIslands';
import { TriageMatrix } from './TriageMatrix';
import { BIView } from './BIView';
import { TicketDrawer } from './TicketDrawer';
import { IngestModal } from './IngestModal';
import { SphereLogo } from './SphereLogo';
import { useApp } from '../context/AppContext';
import { Activity, Sun, Moon, Briefcase, UserCheck } from 'lucide-react';

type View = 'triage' | 'bi';

export function Dashboard() {
  const [activeView, setActiveView] = useState<View>('triage');
  const [showIngest, setShowIngest] = useState(false);
  const { selectedTicket, setSelectedTicket, theme, toggleTheme, role, setRole, currentUser } = useApp();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: theme === 'dark'
          ? '#07080B'
          : 'radial-gradient(ellipse at 15% 0%, rgba(224, 231, 255, 0.75) 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, rgba(224, 242, 254, 0.7) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(245, 243, 255, 0.65) 0%, transparent 60%), #F1F5F9',
        color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
      }}
    >
      {/* Fixed Header with Heavy Blur */}
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(7, 8, 11, 0.92)' : 'rgba(241, 245, 249, 0.92)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: theme === 'dark' ? '0 10px 30px -10px rgba(0,0,0,0.6)' : '0 4px 20px -2px rgba(99,102,241,0.08)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo + Wordmark */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <SphereLogo size={32} />
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-base sm:text-lg font-bold tracking-tight"
                style={{
                  color: theme === 'dark' ? '#F8FAFC' : '#1E1B4B',
                  letterSpacing: '-0.02em',
                }}
              >
                TriageSphere
              </span>
              <span
                className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                  border: theme === 'dark' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.25)',
                  color: theme === 'dark' ? '#a5b4fc' : '#4f46e5',
                }}
              >
                Enterprise
              </span>
            </div>
          </div>

          {/* Center: View Switcher (Responsive) */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <button
              onClick={() => setActiveView('triage')}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={
                activeView === 'triage'
                  ? {
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: theme === 'dark' ? '#a5b4fc' : '#4f46e5',
                    }
                  : { color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)', border: '1px solid transparent' }
              }
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Live Triage Matrix</span>
              <span className="inline xs:hidden sm:hidden">Matrix</span>
            </button>
            <button
              onClick={() => setActiveView('bi')}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={
                activeView === 'bi'
                  ? {
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: theme === 'dark' ? '#6ee7b7' : '#059669',
                    }
                  : { color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)', border: '1px solid transparent' }
              }
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden xs:inline sm:inline">Executive BI</span>
              <span className="inline xs:hidden sm:hidden">BI</span>
            </button>
          </div>

          {/* Right Controls: Role Switcher + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona / Role Switcher */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              }}
              title="Click to toggle perspective"
              onClick={() => setRole(role === 'manager' ? 'agent' : 'manager')}
            >
              {role === 'manager' ? (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">Role:</span>
                  <span className="font-semibold text-indigo-400">Director</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Role:</span>
                  <span className="font-semibold text-emerald-400">Priya</span>
                </>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: theme === 'dark' ? '#fbbf24' : '#6366f1',
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-screen-2xl mx-auto px-4 sm:px-6 pb-8">
        {/* Role Banner Notification */}
        {role === 'agent' && (
          <div
            className="mb-4 px-4 py-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#34d399',
            }}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Assigned Engineer Perspective Active:</strong> Logged in as <strong>{currentUser}</strong>.
              </span>
            </div>
            <button
              onClick={() => setRole('manager')}
              className="text-xs underline hover:opacity-80 text-left sm:text-right"
            >
              Switch to Director View
            </button>
          </div>
        )}

        <KpiIslands />
        <div className="mt-6">
          {activeView === 'triage' ? (
            <TriageMatrix onIngest={() => setShowIngest(true)} />
          ) : (
            <BIView />
          )}
        </div>
      </main>

      {/* Ticket Drawer */}
      {selectedTicket && (
        <TicketDrawer ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      {/* Ingest Modal */}
      {showIngest && <IngestModal onClose={() => setShowIngest(false)} />}
    </div>
  );
}
