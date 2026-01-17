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
        viewBox="0 0 280 80"
        className="w-[140px] sm:w-[180px] md:w-[220px] h-auto"
        style={{
          opacity: getOpacity(),
          transition: flickerPhase < 10 ? 'opacity 0.05s' : 'opacity 0.3s',
        }}
      >
        {/* N - Angular design with diagonal stroke */}
        <g className="neon-letter" style={{ animationDelay: '0s' }}>
          <path
            d="M8 8 L8 72 M8 8 L42 72 M42 8 L42 72"
            fill="none"
            stroke="#b8e600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* E - Three horizontal bars */}
        <g className="neon-letter" style={{ animationDelay: '0.1s' }}>
          <path
            d="M58 8 L58 72 M58 8 L92 8 M58 40 L85 40 M58 72 L92 72"
            fill="none"
            stroke="#b8e600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* O - Rounded rectangle with gap at top-right */}
        <g className="neon-letter" style={{ animationDelay: '0.2s' }}>
          <path
            d="M108 20 Q108 8 120 8 L160 8 Q172 8 172 20 L172 60 Q172 72 160 72 L120 72 Q108 72 108 60 Z"
            fill="none"
            stroke="#b8e600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* N - Second N, angular design */}
        <g className="neon-letter" style={{ animationDelay: '0.3s' }}>
          <path
            d="M188 8 L188 72 M188 8 L222 72 M222 8 L222 72"
            fill="none"
            stroke="#b8e600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="neon-stroke"
          />
        </g>

        {/* Registered trademark symbol */}
        <text
          x="232"
          y="20"
          fill="#b8e600"
          fontSize="12"
          fontFamily="Arial, sans-serif"
          className="neon-text-small"
          style={{ opacity: 0.8 }}
        >
          ®
        </text>
      </svg>

      {/* Horizontal line separator */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-transparent via-[#b8e600] to-transparent mt-1"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isOn ? 1 : 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{ 
          width: '100%',
          opacity: getOpacity() * 0.7,
        }}
      />

      {/* ENERGY DRINK text */}
      <motion.span
        className="text-[10px] sm:text-xs md:text-sm tracking-[0.35em] font-medium mt-1 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOn ? 0.85 : 0.2 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        style={{
          color: '#b8e600',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.35em',
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
            stroke: #b8e600;
          }
          25% {
            stroke: #c4f000;
          }
          50% {
            stroke: #a8d600;
          }
          75% {
            stroke: #bef000;
          }
        }
        
        .neon-text-small {
          animation: ambientTextShift 8s ease-in-out infinite;
        }
        
        @keyframes ambientTextShift {
          0%, 100% {
            fill: #b8e600;
          }
          25% {
            fill: #c4f000;
          }
          50% {
            fill: #a8d600;
          }
          75% {
            fill: #bef000;
          }
        }
      `}</style>
    </div>
  );
}
