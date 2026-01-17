import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NeonLogoProps {
  className?: string;
  onClick?: () => void;
}

export default function NeonLogo({ className = "", onClick }: NeonLogoProps) {
  const [isOn, setIsOn] = useState(false);
  const [flickerPhase, setFlickerPhase] = useState(0);
  const [currentColor, setCurrentColor] = useState("#c8ff00");
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Ambient color palette - smooth neon color transitions
  const neonColors = [
    "#c8ff00", // Neon green (primary)
    "#00ff88", // Neon teal
    "#00ffff", // Cyan
    "#ff00ff", // Magenta
    "#ff0080", // Hot pink
    "#ff6600", // Orange
    "#ffff00", // Yellow
    "#c8ff00", // Back to green
  ];

  // Smooth ambient color animation
  useEffect(() => {
    if (flickerPhase < 10) return; // Don't start color animation until logo is on
    
    startTimeRef.current = performance.now();
    
    const animateColor = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current;
      const cycleDuration = 16000; // 16 seconds for full color cycle
      const progress = (elapsed % cycleDuration) / cycleDuration;
      
      // Calculate which color segment we're in
      const totalSegments = neonColors.length - 1;
      const segmentProgress = progress * totalSegments;
      const segmentIndex = Math.floor(segmentProgress);
      const segmentFraction = segmentProgress - segmentIndex;
      
      // Interpolate between colors
      const color1 = neonColors[segmentIndex];
      const color2 = neonColors[Math.min(segmentIndex + 1, neonColors.length - 1)];
      const interpolatedColor = interpolateColor(color1, color2, segmentFraction);
      
      setCurrentColor(interpolatedColor);
      animationRef.current = requestAnimationFrame(animateColor);
    };
    
    animationRef.current = requestAnimationFrame(animateColor);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [flickerPhase]);

  // Color interpolation helper
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const hex1 = color1.replace("#", "");
    const hex2 = color2.replace("#", "");
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Realistic neon "turn on" flicker effect - like a real neon sign
  useEffect(() => {
    // More realistic flicker sequence - mimics gas ionization in real neon tubes
    const flickerSequence = [
      { delay: 50, on: true, brightness: 0.3 },
      { delay: 100, on: false, brightness: 0 },
      { delay: 180, on: true, brightness: 0.5 },
      { delay: 220, on: false, brightness: 0.1 },
      { delay: 300, on: true, brightness: 0.7 },
      { delay: 350, on: false, brightness: 0.2 },
      { delay: 420, on: true, brightness: 0.4 },
      { delay: 480, on: true, brightness: 0.9 },
      { delay: 520, on: false, brightness: 0.3 },
      { delay: 600, on: true, brightness: 0.6 },
      { delay: 680, on: true, brightness: 1.0 },
      { delay: 720, on: false, brightness: 0.4 },
      { delay: 800, on: true, brightness: 1.0 },
    ];

    flickerSequence.forEach(({ delay, on, brightness }, index) => {
      setTimeout(() => {
        setFlickerPhase(index);
        setIsOn(on);
      }, delay);
    });

    // Final stable on state with occasional subtle flicker
    setTimeout(() => {
      setIsOn(true);
      setFlickerPhase(10); // Stable phase
    }, 900);

    // Random subtle flickers after stabilization (like real neon signs)
    const subtleFlickerInterval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance of subtle flicker
        setFlickerPhase(11); // Subtle flicker phase
        setTimeout(() => setFlickerPhase(10), 50 + Math.random() * 100);
      }
    }, 3000);

    return () => clearInterval(subtleFlickerInterval);
  }, []);

  // Calculate opacity and glow based on flicker phase
  const getOpacity = () => {
    if (flickerPhase < 10) {
      return isOn ? 0.7 + Math.random() * 0.3 : 0.15;
    }
    if (flickerPhase === 11) {
      return 0.85; // Subtle flicker
    }
    return 1;
  };

  const getGlowIntensity = () => {
    if (flickerPhase < 10) {
      return isOn ? 15 + Math.random() * 10 : 2;
    }
    if (flickerPhase === 11) {
      return 12; // Reduced glow during subtle flicker
    }
    return 20;
  };

  const glowIntensity = getGlowIntensity();

  return (
    <div 
      className={`flex flex-col cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Main NEON Text - SVG with realistic 3D neon effect */}
      <svg
        viewBox="0 0 320 70"
        className="w-[120px] sm:w-[140px] md:w-[160px] h-auto"
        style={{
          opacity: getOpacity(),
          transition: flickerPhase < 10 ? 'opacity 0.03s' : 'opacity 0.15s',
        }}
      >
        {/* Glow filter definitions for realistic neon effect */}
        <defs>
          {/* Outer glow - diffuse */}
          <filter id="neonGlowOuter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowIntensity * 0.8} result="blur1" />
            <feFlood floodColor={currentColor} floodOpacity="0.6" />
            <feComposite in2="blur1" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Inner glow - sharp */}
          <filter id="neonGlowInner" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={glowIntensity * 0.3} result="blur2" />
            <feFlood floodColor={currentColor} floodOpacity="0.9" />
            <feComposite in2="blur2" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Combined 3D neon effect */}
          <filter id="neon3D" x="-100%" y="-100%" width="300%" height="300%">
            {/* Outer diffuse glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={glowIntensity} result="blur1" />
            <feFlood floodColor={currentColor} floodOpacity="0.4" result="color1" />
            <feComposite in="color1" in2="blur1" operator="in" result="glow1" />
            
            {/* Middle glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={glowIntensity * 0.5} result="blur2" />
            <feFlood floodColor={currentColor} floodOpacity="0.6" result="color2" />
            <feComposite in="color2" in2="blur2" operator="in" result="glow2" />
            
            {/* Inner bright glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={glowIntensity * 0.2} result="blur3" />
            <feFlood floodColor="#ffffff" floodOpacity="0.3" result="color3" />
            <feComposite in="color3" in2="blur3" operator="in" result="glow3" />
            
            {/* Combine all layers */}
            <feMerge>
              <feMergeNode in="glow1" />
              <feMergeNode in="glow2" />
              <feMergeNode in="glow3" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow layer */}
        <g filter="url(#neon3D)">
          {/* N */}
          <path
            d="M10 10 L10 60 M10 10 L50 60 M50 10 L50 60"
            fill="none"
            stroke={currentColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* E */}
          <path
            d="M70 10 L70 60 M70 10 L110 10 M70 35 L100 35 M70 60 L110 60"
            fill="none"
            stroke={currentColor}
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
            stroke={currentColor}
            strokeWidth="7"
          />

          {/* N */}
          <path
            d="M200 10 L200 60 M200 10 L240 60 M240 10 L240 60"
            fill="none"
            stroke={currentColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* White hot center line for 3D tube effect */}
        <g style={{ opacity: flickerPhase >= 10 ? 0.4 : 0.2 }}>
          {/* N center */}
          <path
            d="M10 10 L10 60 M10 10 L50 60 M50 10 L50 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* E center */}
          <path
            d="M70 10 L70 60 M70 10 L110 10 M70 35 L100 35 M70 60 L110 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* O center */}
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

          {/* N center */}
          <path
            d="M200 10 L200 60 M200 10 L240 60 M240 10 L240 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Registered trademark symbol with glow */}
        <text
          x="252"
          y="22"
          fill={currentColor}
          fontSize="14"
          fontFamily="Arial, sans-serif"
          style={{ 
            opacity: 0.9,
            filter: `drop-shadow(0 0 ${glowIntensity * 0.3}px ${currentColor})`,
          }}
        >
          ®
        </text>
      </svg>

      {/* Horizontal line separator with glow */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isOn ? 1 : 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        style={{ 
          width: '78%',
          height: '2px',
          backgroundColor: currentColor,
          opacity: getOpacity() * 0.9,
          transformOrigin: 'left',
          boxShadow: `0 0 ${glowIntensity * 0.5}px ${currentColor}, 0 0 ${glowIntensity}px ${currentColor}`,
        }}
        className="mt-0.5"
      />

      {/* ENERGY DRINK text with glow */}
      <motion.span
        className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.25em] font-medium mt-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOn ? 0.9 : 0.2 }}
        transition={{ delay: 1.0, duration: 0.3 }}
        style={{
          color: currentColor,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '0.25em',
          textShadow: flickerPhase >= 10 
            ? `0 0 ${glowIntensity * 0.3}px ${currentColor}, 0 0 ${glowIntensity * 0.6}px ${currentColor}`
            : 'none',
        }}
      >
        ENERGY DRINK
      </motion.span>
    </div>
  );
}
