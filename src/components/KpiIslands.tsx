import { useApp } from '../context/AppContext';
import { computeMetrics } from '../utils/slaEngine';
import { Inbox, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export function KpiIslands() {
  const { tickets, theme } = useApp();
  const metrics = computeMetrics(tickets);
  const total = metrics.sentimentPositive + metrics.sentimentNeutral + metrics.sentimentNegative;
  const posW = total > 0 ? (metrics.sentimentPositive / total) * 100 : 0;
  const neuW = total > 0 ? (metrics.sentimentNeutral / total) * 100 : 0;
  const negW = total > 0 ? (metrics.sentimentNegative / total) * 100 : 0;

  const cards = [
    {
      icon: <Inbox className="w-5 h-5" style={{ color: '#a5b4fc' }} />,
      label: 'Total Ingested',
      value: metrics.totalTickets,
      sub: 'All time',
      glow: 'rgba(99,102,241,0.08)',
      accent: '#6366F1',
    },
    {
      icon: <AlertCircle className="w-5 h-5" style={{ color: '#fbbf24' }} />,
      label: 'Open Backlog',
      value: metrics.openBacklog,
      sub: 'Requiring action',
      glow: 'rgba(245,158,11,0.08)',
      accent: '#F59E0B',
    },
    {
      icon: <Clock className="w-5 h-5" style={{ color: '#34d399' }} />,
      label: 'First-Response SLA',
      value: `${metrics.firstResponseCompliance}%`,
      sub: 'Compliance rate',
      glow: 'rgba(16,185,129,0.08)',
      accent: '#10B981',
    },
    {
      icon: <CheckCircle className="w-5 h-5" style={{ color: '#34d399' }} />,
      label: 'Resolution SLA',
      value: `${metrics.resolutionCompliance}%`,
      sub: 'Compliance rate',
      glow: 'rgba(16,185,129,0.08)',
      accent: '#10B981',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow:
              theme === 'light'
                ? '0 20px 40px -15px rgba(99, 102, 241, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)'
                : 'none',
          }}
        >
          {/* Ambient glow top */}
          <div
            className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${card.glow} 0%, transparent 70%)`,
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${card.glow}`, border: `1px solid ${card.accent}22` }}
              >
                {card.icon}
              </div>
            </div>
            <div
              className="text-3xl font-bold tracking-tight mb-1"
              style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}
            >
              {card.value}
            </div>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#475569' }}
            >
              {card.label}
            </div>
            <div
              className="text-xs"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}
            >
              {card.sub}
            </div>
          </div>
        </div>
      ))}

      {/* Sentiment Distribution */}
      <div
        className="col-span-2 md:col-span-1 lg:col-span-1 relative rounded-2xl p-5 overflow-hidden transition-all duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow:
            theme === 'light'
              ? '0 20px 40px -15px rgba(99, 102, 241, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)'
              : 'none',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: '#a5b4fc' }} />
            </div>
          </div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#475569' }}
          >
            Sentiment Distribution
          </div>
          {/* Bar */}
          <div className="flex h-2 rounded-full overflow-hidden mb-2" style={{ gap: '2px' }}>
            {posW > 0 && (
              <div style={{ width: `${posW}%`, background: '#10B981', borderRadius: '9999px' }} />
            )}
            {neuW > 0 && (
              <div style={{ width: `${neuW}%`, background: '#6366F1', borderRadius: '9999px' }} />
            )}
            {negW > 0 && (
              <div style={{ width: `${negW}%`, background: '#F43F5E', borderRadius: '9999px' }} />
            )}
          </div>
          <div
            className="flex items-center justify-between text-xs font-medium"
            style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}
          >
            <span style={{ color: '#10B981' }}>↑ {metrics.sentimentPositive}</span>
            <span style={{ color: '#6366F1' }}>~ {metrics.sentimentNeutral}</span>
            <span style={{ color: '#F43F5E' }}>↓ {metrics.sentimentNegative}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
