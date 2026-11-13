import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export function AmbientCursorGlow() {
  const { theme } = useApp();
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 overflow-hidden"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '540px',
          height: '540px',
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.08) 35%, rgba(6, 182, 212, 0.03) 55%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(56, 189, 248, 0.1) 40%, rgba(168, 85, 247, 0.05) 60%, transparent 72%)',
          filter: 'blur(20px)',
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
        }}
      />
    </div>
  );
}
