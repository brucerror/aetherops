export function SphereLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)',
      }}
    >
      <svg
        className="w-full h-full p-1.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Boundary */}
        <circle cx="12" cy="12" r="9.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
        {/* Latitude Equator Ellipse */}
        <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
        {/* Longitude Meridian Ellipse */}
        <ellipse cx="12" cy="12" rx="3.8" ry="9.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
        {/* Central Luminous Triage Core */}
        <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
