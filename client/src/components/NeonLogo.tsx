import { useState, useEffect } from "react";

interface NeonLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function NeonLogo({ className = "", onClick }: NeonLogoProps) {
  const [isOn, setIsOn] = useState(false);
  const [flickerPhase, setFlickerPhase] = useState(0);

  // Primary neon green color
  const neonColor = "#c8ff00";

  // Simplified neon "turn on" flicker effect
  useEffect(() => {
    const flickerSequence = [
      { delay: 100, on: true },
      { delay: 200, on: false },
      { delay: 350, on: true },
      { delay: 450, on: false },
      { delay: 600, on: true },
      { delay: 700, on: true },
    ];

    flickerSequence.forEach(({ delay, on }, index) => {
      setTimeout(() => {
        setFlickerPhase(index);
        setIsOn(on);
      }, delay);
    });

    // Final stable on state
    setTimeout(() => {
      setIsOn(true);
      setFlickerPhase(10);
    }, 800);
  }, []);

  // Calculate opacity based on flicker phase
  const getOpacity = () => {
    if (flickerPhase < 10) {
      return isOn ? 0.8 : 0.2;
    }
    return 1;
  };

  return (
    <div 
      className={`flex flex-col cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Main NEON Text - Simplified SVG */}
      <svg
        viewBox="0 0 260 70"
        className="w-[120px] sm:w-[140px] md:w-[160px] h-auto"
        style={{
          opacity: getOpacity(),
          transition: 'opacity 0.1s',
        }}
      >
        {/* Simple glow filter */}
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={neonColor} floodOpacity="0.6" />
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

        {/* White center line for 3D effect */}
        <g style={{ opacity: flickerPhase >= 10 ? 0.3 : 0.1 }}>
          <path
            d="M10 10 L10 60 M10 10 L50 60 M50 10 L50 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 10 L70 60 M70 10 L110 10 M70 35 L100 35 M70 60 L110 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="130"
            y="10"
            width="50"
            height="50"
            rx="8"
            ry="8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <path
            d="M200 10 L200 60 M200 10 L240 60 M240 10 L240 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Registered trademark */}
        <text
          x="248"
          y="22"
          fill={neonColor}
          fontSize="14"
          fontFamily="Arial, sans-serif"
          style={{ opacity: 0.8 }}
        >
          ®
        </text>
      </svg>

      {/* Horizontal line separator */}
      <div
        style={{ 
          width: isOn ? '78%' : '0%',
          height: '2px',
          backgroundColor: neonColor,
          opacity: getOpacity() * 0.8,
          transition: 'width 0.4s ease-out, opacity 0.1s',
          boxShadow: `0 0 8px ${neonColor}`,
        }}
        className="mt-0.5"
      />

      {/* ENERGY DRINK text */}
      <span
        className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-medium mt-0.5"
        style={{
          color: neonColor,
          opacity: isOn ? 0.9 : 0.2,
          transition: 'opacity 0.3s',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.25em',
          textShadow: flickerPhase >= 10 ? `0 0 8px ${neonColor}` : 'none',
        }}
      >
        ENERGY DRINK
      </span>
    </div>
  );
}
