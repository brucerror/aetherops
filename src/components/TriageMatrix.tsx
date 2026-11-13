import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getRemainingHours, getSlaStatus } from '../utils/slaEngine';
import type { Ticket, Department, Priority, TicketStatus } from '../types';
import { Search, Plus, ChevronRight, Filter, Download, AlertOctagon } from 'lucide-react';

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Billing & Finance': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  'API & Infrastructure': { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  'Account Access': { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  'Security': { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
  'Product & Features': { bg: 'rgba(139,92,246,0.12)', text: '#c084fc', border: 'rgba(139,92,246,0.25)' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'rgba(244,63,94,0.15)', text: '#fb7185', border: 'rgba(244,63,94,0.4)' },
  High: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Medium: { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  Low: { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
};

const SENTIMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Positive: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  Neutral: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.12)' },
  Negative: { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
};

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  Enterprise: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
  Growth: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
  Startup: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)' },
};

function SlaTimer({ ticket }: { ticket: Ticket }) {
  const remaining = getRemainingHours(ticket);
  const status = getSlaStatus(remaining);

  if (ticket.status === 'Resolved') {
    return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Resolved</span>;
  }

  const abs = Math.abs(remaining);
  const hours = Math.floor(abs);
  const mins = Math.floor((abs - hours) * 60);

  const colorMap = {
    ok: '#34d399',
    warning: '#fbbf24',
    breach: '#F43F5E',
  };

  return (
    <span
      className="font-mono text-xs font-semibold"
      style={{ color: colorMap[status] }}
    >
      {remaining < 0 ? '−' : ''}{hours}h {mins.toString().padStart(2, '0')}m
    </span>
  );
}

interface TriageMatrixProps {
  onIngest: () => void;
}

export function TriageMatrix({ onIngest }: TriageMatrixProps) {
  const { tickets, setSelectedTicket, role, theme } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'mine'>('all');
  const [slaBreachedOnly, setSlaBreachedOnly] = useState(false);

  const depts: Array<Department | 'All'> = ['All', 'Billing & Finance', 'API & Infrastructure', 'Account Access', 'Security', 'Product & Features'];
  const priorities: Array<Priority | 'All'> = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses: Array<TicketStatus | 'All'> = ['All', 'Open', 'In Progress', 'Waiting on Customer', 'Escalated', 'Resolved'];

  const breachedCount = useMemo(() => {
    return tickets.filter((t) => t.status !== 'Resolved' && getRemainingHours(t) < 0).length;
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (slaBreachedOnly && (t.status === 'Resolved' || getRemainingHours(t) >= 0)) return false;
      if (role === 'agent' && assignedFilter === 'mine' && t.assignedAgent !== 'Priya Nair') return false;
      if (deptFilter !== 'All' && t.department !== deptFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.assignedAgent.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, deptFilter, priorityFilter, statusFilter, search, role, assignedFilter, slaBreachedOnly]);

  const handleExportCsv = () => {
    const headers = ['Ticket ID', 'Customer Name', 'Tier', 'Subject', 'Department', 'Priority', 'Status', 'Sentiment', 'Agent', 'Created At'];
    const rows = filtered.map((t) => [
      t.id,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.customerTier,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.department,
      t.priority,
      t.status,
      t.sentiment,
      t.assignedAgent,
      new Date(t.createdAt).toISOString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `triagesphere-tickets-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Persona Queue Switcher for Agent Mode */}
      {role === 'agent' && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl glass">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Queue Scope:</span>
          <button
            onClick={() => setAssignedFilter('all')}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={
              assignedFilter === 'all'
                ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }
            }
          >
            All Organization Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setAssignedFilter('mine')}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            style={
              assignedFilter === 'mine'
                ? { background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }
            }
          >
            <span>★ Assigned to Priya Nair</span>
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.25)', color: '#34d399' }}
            >
              {tickets.filter((t) => t.assignedAgent === 'Priya Nair').length}
            </span>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-48 transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: theme === 'light' ? '0 2px 8px -1px rgba(15,23,42,0.04)' : 'none',
          }}
        >
          <Search className="w-4 h-4" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search tickets, customers, agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}
          />
        </div>

        {/* Filter: Dept */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3.5 h-3.5 mr-1" style={{ color: 'rgba(255,255,255,0.3)' }} />
          {depts.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={
                deptFilter === d
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {d === 'All' ? 'All Depts' : d}
            </button>
          ))}
        </div>

        {/* Filter: Priority */}
        <div className="flex items-center gap-1">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={
                priorityFilter === p
                  ? { background: 'rgba(244,63,94,0.15)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {p === 'All' ? 'All Priority' : p}
            </button>
          ))}
        </div>

        {/* Filter: Status */}
        <div className="flex items-center gap-1">
          {statuses.filter((s) => s !== 'Waiting on Customer').map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={
                statusFilter === s
                  ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
        </div>

        {/* Filter: SLA Breach Toggle */}
        <button
          onClick={() => setSlaBreachedOnly(!slaBreachedOnly)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
          style={
            slaBreachedOnly
              ? { background: 'rgba(244,63,94,0.2)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.4)', boxShadow: '0 0 12px rgba(244,63,94,0.3)' }
              : { background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#F1F5F9', color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748B', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }
          }
          title="Filter only tickets that breached SLA"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          <span>Breached SLAs</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(244,63,94,0.25)', color: '#fb7185' }}
          >
            {breachedCount}
          </span>
        </button>
      </div>

      {/* Action Buttons: Export CSV + Ingest */}
      <div className="flex items-center gap-2 mb-4 justify-end">
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            color: theme === 'dark' ? '#f8fafc' : '#0F172A',
            boxShadow: theme === 'light' ? '0 2px 8px -1px rgba(15,23,42,0.04)' : 'none',
          }}
          title="Export filtered tickets to CSV"
        >
          <Download className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onIngest}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: '#fff',
            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          Ingest Ticket
        </button>
      </div>

      {/* Table with Horizontal Scroll for Mobile */}
      <div
        className="w-full overflow-x-auto rounded-2xl transition-all duration-300"
        style={{
          background: theme === 'dark' ? 'transparent' : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow:
            theme === 'light'
              ? '0 20px 40px -15px rgba(99, 102, 241, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)'
              : 'none',
        }}
      >
        <div className="min-w-[880px]">
          {/* Header */}
          <div
            className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(241, 245, 249, 0.6)',
              color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#64748B',
              borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              gridTemplateColumns: '85px 1.1fr 2fr 135px 115px 115px 100px 120px 32px',
            }}
          >
          <span>ID</span>
          <span>Customer</span>
          <span>Subject</span>
          <span>Department</span>
          <span>Priority</span>
          <span>Sentiment</span>
          <span>SLA Timer</span>
          <span>Agent</span>
          <span></span>
        </div>

        {/* Rows */}
        <div>
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}>
              No tickets match your filters
            </div>
          ) : (
            filtered.map((ticket, i) => {
              const deptColor = DEPT_COLORS[ticket.department];
              const priColor = PRIORITY_COLORS[ticket.priority];
              const sentColor = SENTIMENT_COLORS[ticket.sentiment];
              const tierColor = TIER_COLORS[ticket.customerTier];
              const isCritical = ticket.priority === 'Critical';

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="grid items-center px-5 py-3.5 cursor-pointer transition-all"
                  style={{
                    gridTemplateColumns: '85px 1.1fr 2fr 135px 115px 115px 100px 120px 32px',
                    borderBottom: i < filtered.length - 1
                      ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)')
                      : 'none',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      theme === 'dark' ? 'rgba(255,255,255,0.025)' : '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {/* ID */}
                  <span className="font-mono text-xs font-semibold" style={{ color: theme === 'dark' ? '#a5b4fc' : '#4f46e5' }}>
                    {ticket.id}
                  </span>

                  {/* Customer */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}>
                      {ticket.customerName}
                    </div>
                    <span
                      className="inline-block text-xs px-1.5 py-0.5 rounded-md mt-0.5"
                      style={{ background: tierColor.bg, color: tierColor.text }}
                    >
                      {ticket.customerTier}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="min-w-0 pr-4">
                    <div className="text-sm truncate" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                      {ticket.subject}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}>
                      {ticket.status}
                    </div>
                  </div>

                  {/* Department */}
                  <span
                    className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-lg truncate max-w-fit"
                    style={{ background: deptColor.bg, color: deptColor.text, border: `1px solid ${deptColor.border}` }}
                  >
                    {ticket.department}
                  </span>

                  {/* Priority */}
                  <span
                    className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: priColor.bg,
                      color: priColor.text,
                      border: `1px solid ${priColor.border}`,
                      ...(isCritical ? {} : {}),
                    }}
                  >
                    <span
                      className={isCritical ? 'pulse-glow' : ''}
                      style={isCritical ? {
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#F43F5E',
                        marginRight: '5px',
                        flexShrink: 0,
                      } : {
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: priColor.text,
                        marginRight: '5px',
                        flexShrink: 0,
                      }}
                    />
                    {ticket.priority}
                  </span>

                  {/* Sentiment */}
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: sentColor.bg,
                      color: sentColor.text,
                      border: `1px solid ${sentColor.border}`,
                      width: 'fit-content',
                    }}
                  >
                    <span>{ticket.sentiment === 'Positive' ? '↑' : ticket.sentiment === 'Negative' ? '↓' : '~'}</span>
                    <span>{ticket.sentiment}</span>
                  </span>

                  {/* SLA Timer */}
                  <SlaTimer ticket={ticket} />

                  {/* Agent */}
                  <span className="text-sm truncate" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#475569' }}>
                    {ticket.assignedAgent}
                  </span>

                  {/* Action */}
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>

      <div className="mt-3 text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}>
        Showing {filtered.length} of {tickets.length} tickets
      </div>
    </div>
  );
}
