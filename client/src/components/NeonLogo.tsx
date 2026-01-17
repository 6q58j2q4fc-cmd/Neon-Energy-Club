import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NeonLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function NeonLogo({ className = "", onClick }: NeonLogoProps) {
  const [isOn, setIsOn] = useState(false);
  const [flickerPhase, setFlickerPhase] = useState(0);

  // Initial "turn on" flicker effect
  useEffect(() => {
    const flickerSequence = [
      { delay: 100, on: true },
      { delay: 150, on: false },
      { delay: 200, on: true },
      { delay: 250, on: false },
      { delay: 350, on: true },
      { delay: 400, on: false },
      { delay: 500, on: true },
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
      setFlickerPhase(10); // Stable phase
    }, 600);
  }, []);

  // Calculate opacity based on flicker phase
  const getOpacity = () => {
    if (flickerPhase < 10) {
      return isOn ? 1 : 0.3;
    }
    return 1;
  };

  return (
    <div 
      className={`flex flex-col cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Main NEON Text - SVG matching the PDF exactly */}
      <svg
        viewBox="0 0 320 70"
        className="w-[120px] sm:w-[140px] md:w-[160px] h-auto"
        style={{
          opacity: getOpacity(),
          transition: flickerPhase < 10 ? 'opacity 0.05s' : 'opacity 0.3s',
        }}
      >
        {/* N - Angular design matching PDF */}
        <g className="neon-letter" style={{ animationDelay: '0s' }}>
          <path
            d="M10 10 L10 60 M10 10 L50 60 M50 10 L50 60"
            fill="none"
            stroke="#c8ff00"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* E - Three horizontal bars matching PDF style */}
        <g className="neon-letter" style={{ animationDelay: '0.1s' }}>
          <path
            d="M70 10 L70 60 M70 10 L110 10 M70 35 L100 35 M70 60 L110 60"
            fill="none"
            stroke="#c8ff00"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* O - Rounded rectangle matching PDF */}
        <g className="neon-letter" style={{ animationDelay: '0.2s' }}>
          <rect
            x="130"
            y="10"
            width="50"
            height="50"
            rx="8"
            ry="8"
            fill="none"
            stroke="#c8ff00"
            strokeWidth="7"
            className="neon-stroke"
          />
        </g>

        {/* N - Second N matching PDF */}
        <g className="neon-letter" style={{ animationDelay: '0.3s' }}>
          <path
            d="M200 10 L200 60 M200 10 L240 60 M240 10 L240 60"
            fill="none"
            stroke="#c8ff00"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* Registered trademark symbol */}
        <text
          x="252"
          y="22"
          fill="#c8ff00"
          fontSize="14"
          fontFamily="Arial, sans-serif"
          className="neon-text-small"
          style={{ opacity: 0.9 }}
        >
          ®
        </text>
      </svg>

      {/* Horizontal line separator - matching PDF, same width as NEON text */}
      <motion.div
        className="bg-[#c8ff00] mt-0.5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isOn ? 1 : 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{ 
          width: '78%', // Match the width of NEON text (ends at second N, not the ® symbol)
          height: '2px',
          opacity: getOpacity() * 0.9,
          transformOrigin: 'left',
        }}
      />

      {/* ENERGY DRINK text - matching PDF spacing */}
      <motion.span
        className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-medium mt-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOn ? 0.9 : 0.2 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        style={{
          color: '#c8ff00',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.25em',
        }}
      >
        ENERGY DRINK
      </motion.span>

      {/* Ambient color transition overlay - subtle, no glow */}
      <style>{`
        .neon-letter {
          animation: ambientColorShift 8s ease-in-out infinite;
        }
        
        .neon-stroke {
          filter: none;
        }
        
        @keyframes ambientColorShift {
          0%, 100% {
            stroke: #c8ff00;
          }
          25% {
            stroke: #d4ff20;
          }
          50% {
            stroke: #b8e600;
          }
          75% {
            stroke: #d0ff10;
          }
        }
        
        .neon-text-small {
          animation: ambientTextShift 8s ease-in-out infinite;
        }
        
        @keyframes ambientTextShift {
          0%, 100% {
            fill: #c8ff00;
          }
          25% {
            fill: #d4ff20;
          }
          50% {
            fill: #b8e600;
          }
          75% {
            fill: #d0ff10;
          }
        }
      `}</style>
    </div>
  );
}
