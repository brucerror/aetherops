import { useState } from 'react';
import type { Ticket, TicketStatus, Department, Priority } from '../types';
import { useApp } from '../context/AppContext';
import { generateDraftResponse } from '../utils/aiEngine';
import { X, Bot, User, Cpu, ChevronDown, Send, Sparkles, Clock, Shield, AlertTriangle, Building } from 'lucide-react';

interface TicketDrawerProps {
  ticket: Ticket;
  onClose: () => void;
}

const STATUS_FLOW: TicketStatus[] = ['Open', 'In Progress', 'Waiting on Customer', 'Escalated', 'Resolved'];

const DEPT_OPTIONS: Department[] = [
  'Billing & Finance',
  'API & Infrastructure',
  'Account Access',
  'Security',
  'Product & Features',
];

const PRIORITY_OPTIONS: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

function ActorIcon({ type }: { type: 'system' | 'ai' | 'agent' }) {
  if (type === 'ai') return <Bot className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />;
  if (type === 'system') return <Cpu className="w-3.5 h-3.5" style={{ color: '#34d399' }} />;
  return <User className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />;
}

export function TicketDrawer({ ticket, onClose }: TicketDrawerProps) {
  const { updateTicketStatus, updateTicketDepartment, updateTicketPriority, sendDraftResponse, theme } = useApp();
  const [draftText, setDraftText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [localDept, setLocalDept] = useState<Department>(ticket.department);
  const [localPriority, setLocalPriority] = useState<Priority>(ticket.priority);

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    setDraftText('');
    const draft = generateDraftResponse(ticket);
    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      setDraftText(draft.substring(0, i));
      if (i >= draft.length) {
        setDraftText(draft);
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 12);
  };

  const handleApproveSend = () => {
    if (!draftText.trim()) return;
    sendDraftResponse(ticket.id, draftText);
    setDraftText('');
  };

  const handleDeptChange = (dept: Department) => {
    setLocalDept(dept);
    updateTicketDepartment(ticket.id, dept);
  };

  const handlePriorityChange = (priority: Priority) => {
    setLocalPriority(priority);
    updateTicketPriority(ticket.id, priority);
  };

  const confidencePct = Math.round(ticket.aiConfidence * 100);
  const confColor = confidencePct >= 85 ? '#10B981' : confidencePct >= 70 ? '#F59E0B' : '#F43F5E';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="slide-in-right fixed top-0 right-0 h-full z-50 flex flex-col transition-all duration-200"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: theme === 'dark' ? '#0C0D12' : '#FFFFFF',
          borderLeft: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: theme === 'dark' ? '-24px 0 80px rgba(0,0,0,0.6)' : '-10px 0 40px rgba(15,23,42,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold" style={{ color: theme === 'dark' ? '#a5b4fc' : '#4f46e5' }}>{ticket.id}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: ticket.status === 'Resolved' ? 'rgba(16,185,129,0.15)' : ticket.status === 'Escalated' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                  color: ticket.status === 'Resolved' ? '#34d399' : ticket.status === 'Escalated' ? '#fb7185' : '#a5b4fc',
                  border: `1px solid ${ticket.status === 'Resolved' ? 'rgba(16,185,129,0.3)' : ticket.status === 'Escalated' ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
                }}
              >
                {ticket.status}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug pr-8" style={{ color: theme === 'dark' ? '#f8fafc' : '#0F172A' }}>
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B' }}>
              <span>{ticket.customerName}</span>
              <span>·</span>
              <span>{ticket.customerEmail}</span>
              <span>·</span>
              <span
                className="px-1.5 py-0.5 rounded"
                style={{
                  background: ticket.customerTier === 'Enterprise' ? 'rgba(99,102,241,0.15)' : ticket.customerTier === 'Growth' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                  color: ticket.customerTier === 'Enterprise' ? '#a5b4fc' : ticket.customerTier === 'Growth' ? '#34d399' : 'rgba(255,255,255,0.5)',
                }}
              >
                {ticket.customerTier}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Customer Account & Contract Intelligence Card */}
          <section
            className="rounded-xl p-3.5 transition-all"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" style={{ color: '#818cf8' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}>
                  Account & Contract Intelligence
                </span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                {ticket.customerTier} Tier
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div
                className="p-2 rounded-lg"
                style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}
              >
                <div className="opacity-60 mb-0.5 text-[11px]">Contract Value</div>
                <div className="font-bold text-sm" style={{ color: '#10B981' }}>
                  {ticket.customerTier === 'Enterprise' ? '$180,000/yr' : ticket.customerTier === 'Growth' ? '$48,000/yr' : '$12,000/yr'}
                </div>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}
              >
                <div className="opacity-60 mb-0.5 text-[11px]">Contract Status</div>
                <div className="font-semibold" style={{ color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}>
                  Q1 2027 • Active
                </div>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}
              >
                <div className="opacity-60 mb-0.5 text-[11px]">Retention Risk</div>
                <div className="font-semibold" style={{ color: ticket.priority === 'Critical' ? '#F43F5E' : '#34D399' }}>
                  {ticket.priority === 'Critical' ? 'High Risk' : 'Low Risk'}
                </div>
              </div>
            </div>
          </section>

          {/* Original Message */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Original Message
            </h3>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {ticket.body}
            </div>
          </section>

          {/* AI Diagnostic */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4" style={{ color: '#a5b4fc' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a5b4fc' }}>
                AI Diagnostic Hypothesis
              </h3>
              <span
                className="ml-auto text-xs font-mono font-bold"
                style={{ color: confColor }}
              >
                {confidencePct}% confidence
              </span>
            </div>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              {ticket.aiDiagnosis}
            </div>
            {ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ticket.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* HITL Action Panel */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                HITL Action Panel
              </h3>
            </div>

            {/* Override controls */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Department Override</label>
                <div className="relative">
                  <select
                    value={localDept}
                    onChange={(e) => handleDeptChange(e.target.value as Department)}
                    className="w-full appearance-none rounded-xl px-3 py-2 text-sm pr-8"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      outline: 'none',
                    }}
                  >
                    {DEPT_OPTIONS.map((d) => (
                      <option key={d} value={d} style={{ background: '#0C0D12' }}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Priority Override</label>
                <div className="relative">
                  <select
                    value={localPriority}
                    onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                    className="w-full appearance-none rounded-xl px-3 py-2 text-sm pr-8"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      outline: 'none',
                    }}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p} style={{ background: '#0C0D12' }}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
              </div>
            </div>

            {/* Generate AI Draft */}
            <button
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mb-3 transition-all"
              style={{
                background: isGenerating ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
                width: '100%',
                justifyContent: 'center',
                cursor: isGenerating ? 'wait' : 'pointer',
              }}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating AI Draft...' : 'Generate AI Draft Response'}
            </button>

            {/* Editable textarea */}
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={8}
              placeholder="AI-generated draft will appear here. You can edit before sending..."
              className="w-full rounded-xl p-4 text-sm leading-relaxed resize-none outline-none typing-appear"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'inherit',
              }}
            />

            {/* Approve & Send */}
            <button
              onClick={handleApproveSend}
              disabled={!draftText.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mt-3 w-full justify-center transition-all"
              style={{
                background: draftText.trim()
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: draftText.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: draftText.trim() ? 'pointer' : 'not-allowed',
                boxShadow: draftText.trim() ? '0 0 20px rgba(16,185,129,0.25)' : 'none',
              }}
            >
              <Send className="w-4 h-4" />
              Approve & Send Response
            </button>
          </section>

          {/* Status Lifecycle */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Status Lifecycle
              </h3>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_FLOW.map((s) => {
                const isActive = ticket.status === s;
                const isPassed = STATUS_FLOW.indexOf(s) < STATUS_FLOW.indexOf(ticket.status);
                return (
                  <button
                    key={s}
                    onClick={() => updateTicketStatus(ticket.id, s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={
                      isActive
                        ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
                        : isPassed
                        ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {isPassed && <span className="mr-1">✓</span>}
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Audit Trail */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Immutable Audit Trail
              </h3>
            </div>
            <div className="space-y-2">
              {[...ticket.activityLog].reverse().map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: log.actorType === 'ai' ? 'rgba(99,102,241,0.15)' : log.actorType === 'system' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    }}
                  >
                    <ActorIcon type={log.actorType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: '#f8fafc' }}>{log.actor}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{log.action}</span>
                      <span className="text-xs ml-auto font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
