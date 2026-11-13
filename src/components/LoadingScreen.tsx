import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SphereLogo } from './SphereLogo';

interface LoadingScreenProps {
  onFinish: () => void;
}

const STEPS = [
  'Initializing TriageSphere Neural Core...',
  'Calibrating ITIL Dual-SLA Engine...',
  'Synthesizing Enterprise Audit Matrix...',
  'Operational Readiness Verified. Launching...',
];

export function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setFadeout(true);
          setTimeout(() => {
            onFinish();
          }, 600);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onFinish]);

  useEffect(() => {
    if (progress < 30) setStepIndex(0);
    else if (progress < 65) setStepIndex(1);
    else if (progress < 90) setStepIndex(2);
    else setStepIndex(3);
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        fadeout ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #11131F 0%, #07080B 75%, #050608 100%)',
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -translate-y-12"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.08) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Pulsing Sphere Emblem */}
        <div className="relative mb-6">
          <SphereLogo size={64} />
          {/* Animated ripple ring */}
          <div
            className="absolute inset-0 rounded-2xl animate-ping opacity-25 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          />
        </div>

        {/* Brand Wordmark */}
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          TriageSphere
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>360° Operational Triage Intelligence</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 h-1.5 rounded-full overflow-hidden mb-3 relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #10B981 100%)',
              boxShadow: '0 0 12px rgba(99,102,241,0.8)',
            }}
          />
        </div>

        {/* Step Indicator & Percentage */}
        <div className="flex items-center justify-between w-64 text-[11px] font-mono text-slate-400 mb-2">
          <span className="truncate pr-2">{STEPS[stepIndex]}</span>
          <span className="font-bold text-indigo-300">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
