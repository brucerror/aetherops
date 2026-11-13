import { useApp } from '../context/AppContext';
import { computeDepartmentStats } from '../utils/slaEngine';
import { TrendingUp, AlertTriangle, Lightbulb, Shield, Zap, BarChart3 } from 'lucide-react';

const DEPT_COLORS: Record<string, { main: string; bg: string }> = {
  'Billing & Finance': { main: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  'API & Infrastructure': { main: '#a5b4fc', bg: 'rgba(99,102,241,0.15)' },
  'Account Access': { main: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Security': { main: '#fb7185', bg: 'rgba(244,63,94,0.15)' },
  'Product & Features': { main: '#c084fc', bg: 'rgba(139,92,246,0.15)' },
};

function HorizontalBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function BIView() {
  const { tickets, theme } = useApp();
  const stats = computeDepartmentStats(tickets);
  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  const maxBreach = Math.max(...stats.map((s) => s.breachCount), 1);

  const recommendations = [
    {
      icon: <Shield className="w-5 h-5" style={{ color: '#fb7185' }} />,
      title: 'Harden API Key Lifecycle Management',
      evidence: 'Security department accounts for 2 Critical tickets including confirmed API key exfiltration. Implement automated key rotation reminders and anomaly detection on API usage patterns.',
      impact: 'High',
      impactColor: '#fb7185',
    },
    {
      icon: <Zap className="w-5 h-5" style={{ color: '#fbbf24' }} />,
      title: 'Deploy SAML Certificate Expiry Monitoring',
      evidence: 'SSO certificate expiry caused 100% user lockout for Enterprise customer. Implement 30/14/7-day certificate expiry alerts with automated renewal workflow to prevent recurrence.',
      impact: 'High',
      impactColor: '#fbbf24',
    },
    {
      icon: <TrendingUp className="w-5 h-5" style={{ color: '#34d399' }} />,
      title: 'Invest in Bulk Export Self-Service',
      evidence: 'Product & Features shows demand clustering for bulk CSV export across Growth tier (4 tickets in 90 days). Shipping self-service export would deflect ~8 hrs/week of support volume.',
      impact: 'Medium',
      impactColor: '#34d399',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Row */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <BarChart3 className="w-5 h-5" style={{ color: '#34d399' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold" style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}>Executive BI Intelligence</h2>
          <p className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}>Operational analytics and evidence-backed recommendations</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Departmental Volume Chart */}
        <div
          className="col-span-2 rounded-2xl p-6 transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: theme === 'light' ? '0 4px 16px -2px rgba(15,23,42,0.05)' : 'none',
          }}
        >
          <h3 className="text-sm font-semibold mb-5" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}>
            Departmental Ticket Volume
          </h3>
          <div className="space-y-4">
            {stats.map((stat) => {
              const col = DEPT_COLORS[stat.department];
              return (
                <div key={stat.department}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: col.main }}>{stat.department}</span>
                    <div className="flex items-center gap-3 text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}>
                      {stat.criticalCount > 0 && (
                        <span style={{ color: '#fb7185' }}>{stat.criticalCount} Critical</span>
                      )}
                      <span className="font-semibold" style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}>{stat.count} tickets</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HorizontalBar value={stat.count} max={maxCount} color={col.main} />
                    <span className="text-xs font-mono w-8 text-right" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}>
                      {stat.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA Breach Risk */}
        <div
          className="rounded-2xl p-6 transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: theme === 'light' ? '0 4px 16px -2px rgba(15,23,42,0.05)' : 'none',
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}>
            SLA Breach Risk
          </h3>
          <div className="space-y-3">
            {stats.map((stat) => {
              const riskLevel = stat.breachCount === 0 ? 'none' : stat.breachCount === 1 ? 'low' : 'high';
              const riskColor = { none: '#34d399', low: '#fbbf24', high: '#F43F5E' }[riskLevel];
              return (
                <div key={stat.department} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {stat.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${maxBreach > 0 ? (stat.breachCount / maxBreach) * 100 : 0}%`, background: riskColor }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color: riskColor }}>
                        {stat.breachCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Avg Resolution */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Avg. Resolution (hrs)
            </div>
            {stats.filter((s) => s.avgResolutionHours > 0).map((stat) => (
              <div key={stat.department} className="flex items-center justify-between py-1">
                <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '120px' }}>
                  {stat.department}
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: '#f8fafc' }}>
                  {stat.avgResolutionHours}h
                </span>
              </div>
            ))}
            {stats.filter((s) => s.avgResolutionHours > 0).length === 0 && (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No resolved tickets yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4" style={{ color: '#fbbf24' }} />
          <h3 className="text-sm font-semibold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}>
            Evidence-Backed Recommendations
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: theme === 'light' ? '0 4px 16px -2px rgba(15,23,42,0.05)' : 'none',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }}
                >
                  {rec.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold leading-snug mb-1" style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}>
                    {rec.title}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: rec.impactColor }}
                  >
                    {rec.impact} Impact
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#475569' }}>
                {rec.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority × Department Heatmap Table */}
      <div
        className="rounded-2xl p-6 transition-all"
        style={{
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: theme === 'light' ? '0 4px 16px -2px rgba(15,23,42,0.05)' : 'none',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} />
          <h3 className="text-sm font-semibold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155' }}>
            Priority × Department Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <th className="text-left pb-3 pr-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#64748B', fontWeight: 600 }}>Department</th>
                {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <th key={p} className="text-right pb-3 px-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#64748B', fontWeight: 600 }}>{p}</th>
                ))}
                <th className="text-right pb-3 pl-3" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#64748B', fontWeight: 600 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => {
                const deptTickets = tickets.filter((t) => t.department === stat.department);
                const counts = {
                  Critical: deptTickets.filter((t) => t.priority === 'Critical').length,
                  High: deptTickets.filter((t) => t.priority === 'High').length,
                  Medium: deptTickets.filter((t) => t.priority === 'Medium').length,
                  Low: deptTickets.filter((t) => t.priority === 'Low').length,
                };
                const col = DEPT_COLORS[stat.department];
                return (
                  <tr key={stat.department} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-3 pr-4 font-medium" style={{ color: col.main }}>{stat.department}</td>
                    <td className="py-3 px-3 text-right">
                      {counts.Critical > 0 ? (
                        <span className="font-semibold" style={{ color: '#fb7185' }}>{counts.Critical}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {counts.High > 0 ? (
                        <span className="font-semibold" style={{ color: '#fbbf24' }}>{counts.High}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {counts.Medium > 0 ? (
                        <span style={{ color: '#a5b4fc' }}>{counts.Medium}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {counts.Low > 0 ? (
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{counts.Low}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="py-3 pl-3 text-right font-semibold" style={{ color: '#f8fafc' }}>{stat.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
