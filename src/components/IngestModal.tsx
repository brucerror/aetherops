import React, { useState } from 'react';
import type { Ticket } from '../types';
import { useApp } from '../context/AppContext';
import { classifyTicket } from '../utils/aiEngine';
import { X, Bot, Sparkles, CheckCircle, ChevronDown } from 'lucide-react';

interface IngestModalProps {
  onClose: () => void;
}

type Step = 'form' | 'classifying' | 'preview';

export function IngestModal({ onClose }: IngestModalProps) {
  const { addTicket } = useApp();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerTier: 'Growth' as Ticket['customerTier'],
    subject: '',
    body: '',
  });
  const [preview, setPreview] = useState<ReturnType<typeof classifyTicket> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('classifying');
    setTimeout(() => {
      const result = classifyTicket(formData.subject, formData.body);
      setPreview(result);
      setStep('preview');
    }, 1600);
  };

  const handleConfirm = () => {
    addTicket(formData);
    onClose();
  };

  const DEPT_COLORS: Record<string, string> = {
    'Billing & Finance': '#fbbf24',
    'API & Infrastructure': '#a5b4fc',
    'Account Access': '#34d399',
    'Security': '#fb7185',
    'Product & Features': '#c084fc',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    Critical: '#fb7185',
    High: '#fbbf24',
    Medium: '#a5b4fc',
    Low: 'rgba(255,255,255,0.4)',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="fade-in w-full max-w-lg rounded-2xl"
          style={{
            background: '#0C0D12',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#a5b4fc' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#f8fafc' }}>
                Ingest New Ticket
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Customer Name *</label>
                    <input
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                      }}
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                      }}
                      placeholder="ops@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Customer Tier</label>
                  <div className="relative">
                    <select
                      value={formData.customerTier}
                      onChange={(e) => setFormData({ ...formData, customerTier: e.target.value as Ticket['customerTier'] })}
                      className="w-full appearance-none rounded-xl px-3 py-2 text-sm pr-8 outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                      }}
                    >
                      <option value="Enterprise" style={{ background: '#0C0D12' }}>Enterprise</option>
                      <option value="Growth" style={{ background: '#0C0D12' }}>Growth</option>
                      <option value="Startup" style={{ background: '#0C0D12' }}>Startup</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Subject *</label>
                  <input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                    }}
                    placeholder="Brief description of the issue..."
                  />
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Issue Description *</label>
                  <textarea
                    required
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={5}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      fontFamily: 'inherit',
                    }}
                    placeholder="Detailed description of the issue, steps to reproduce, business impact..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                  }}
                >
                  Classify & Ingest →
                </button>
              </form>
            )}

            {step === 'classifying' && (
              <div className="py-10 flex flex-col items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.2)',
                  }}
                >
                  <Bot className="w-8 h-8 animate-pulse" style={{ color: '#a5b4fc' }} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold mb-1" style={{ color: '#f8fafc' }}>
                    AI Classification in progress...
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Analyzing department, priority, sentiment & generating diagnosis
                  </div>
                </div>
                {/* Animated dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: '#6366F1',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 'preview' && preview && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4" style={{ color: '#34d399' }} />
                    <span className="text-sm font-semibold" style={{ color: '#34d399' }}>
                      Classification Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Department</span>
                      <div className="font-medium mt-0.5" style={{ color: DEPT_COLORS[preview.department] }}>
                        {preview.department}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Priority</span>
                      <div className="font-medium mt-0.5" style={{ color: PRIORITY_COLORS[preview.priority] }}>
                        {preview.priority}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sentiment</span>
                      <div className="font-medium mt-0.5" style={{ color: preview.sentiment === 'Negative' ? '#fb7185' : preview.sentiment === 'Positive' ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
                        {preview.sentiment}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>AI Confidence</span>
                      <div className="font-semibold font-mono mt-0.5" style={{ color: '#10B981' }}>
                        {Math.round(preview.aiConfidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl p-3 text-xs leading-relaxed"
                  style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  <span className="font-semibold" style={{ color: '#a5b4fc' }}>AI Diagnosis: </span>
                  {preview.aiDiagnosis}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    ← Edit
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                    }}
                  >
                    Confirm & Create Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
