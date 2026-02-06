interface NeonLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function NeonLogo({ className = "", onClick }: NeonLogoProps) {
  const neonColor = "#c8ff00";

  return (
    <div 
      className={`flex flex-col items-center cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Main NEON Text - Static SVG */}
      <svg
        viewBox="0 0 260 70"
        className="w-[140px] sm:w-[170px] md:w-[200px] h-auto"
      >
        {/* Simple glow filter */}
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={neonColor} floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Letters with glow */}
        <g filter="url(#neonGlow)">
          {/* N */}
          <path
            d="M10 10 L10 60 M10 10 L50 60 M50 10 L50 60"
            fill="none"
            stroke={neonColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* E */}
          <path
            d="M70 10 L70 60 M70 10 L110 10 M70 35 L100 35 M70 60 L110 60"
            fill="none"
            stroke={neonColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* O */}
          <rect
            x="130"
            y="10"
            width="50"
            height="50"
            rx="8"
            ry="8"
            fill="none"
            stroke={neonColor}
            strokeWidth="7"
          />

          {/* N */}
          <path
            d="M200 10 L200 60 M200 10 L240 60 M240 10 L240 60"
            fill="none"
            stroke={neonColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Registered trademark - more prominent */}
        <text
          x="250"
          y="18"
          fill={neonColor}
          fontSize="16"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          filter="url(#neonGlow)"
          style={{ opacity: 0.95 }}
        >
          ®
        </text>
      </svg>

      {/* Horizontal line separator - shorter to match text width */}
      <div
        className="mt-0.5 mx-auto"
        style={{ 
          width: '85%',
          maxWidth: '140px',
          height: '2px',
          background: `linear-gradient(90deg, transparent 5%, ${neonColor} 20%, ${neonColor} 80%, transparent 95%)`,
          boxShadow: `0 0 8px ${neonColor}`,
        }}
      />

      {/* ENERGY DRINK text - centered */}
      <span
        className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-medium mt-0.5 text-center"
        style={{
          color: neonColor,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.25em',
          textShadow: `0 0 6px ${neonColor}`,
        }}
      >
        ENERGY DRINK
      </span>
    </div>
  );
}
