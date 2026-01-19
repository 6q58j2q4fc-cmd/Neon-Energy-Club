// Vice City Neon Building Skyline - Optimized for performance
export function NeonSkyline({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1200 300"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Building silhouettes with simple colored strokes - no filters for performance */}
        <g className="opacity-50">
          {/* Tall building left */}
          <rect x="50" y="100" width="80" height="200" fill="#0a0418" />
          <rect x="50" y="100" width="80" height="200" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.6" />
          
          {/* Medium building */}
          <rect x="150" y="150" width="60" height="150" fill="#0a0418" />
          <rect x="150" y="150" width="60" height="150" fill="none" stroke="#ff0080" strokeWidth="1" opacity="0.5" />
          
          {/* Skyscraper */}
          <rect x="230" y="50" width="70" height="250" fill="#0a0418" />
          <rect x="230" y="50" width="70" height="250" fill="none" stroke="#bf5af2" strokeWidth="1" opacity="0.6" />
          
          {/* Wide building */}
          <rect x="320" y="180" width="100" height="120" fill="#0a0418" />
          <rect x="320" y="180" width="100" height="120" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.4" />
          
          {/* Tower */}
          <rect x="440" y="80" width="50" height="220" fill="#0a0418" />
          <rect x="440" y="80" width="50" height="220" fill="none" stroke="#ff0080" strokeWidth="1" opacity="0.6" />
          
          {/* Hotel-style building */}
          <rect x="510" y="120" width="90" height="180" fill="#0a0418" />
          <rect x="510" y="120" width="90" height="180" fill="none" stroke="#bf5af2" strokeWidth="1" opacity="0.5" />
          
          {/* More buildings on right side */}
          <rect x="620" y="160" width="70" height="140" fill="#0a0418" />
          <rect x="620" y="160" width="70" height="140" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.5" />
          
          <rect x="710" y="90" width="60" height="210" fill="#0a0418" />
          <rect x="710" y="90" width="60" height="210" fill="none" stroke="#ff0080" strokeWidth="1" opacity="0.6" />
          
          <rect x="790" y="140" width="80" height="160" fill="#0a0418" />
          <rect x="790" y="140" width="80" height="160" fill="none" stroke="#bf5af2" strokeWidth="1" opacity="0.4" />
          
          <rect x="890" y="100" width="55" height="200" fill="#0a0418" />
          <rect x="890" y="100" width="55" height="200" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.6" />
          
          <rect x="965" y="170" width="85" height="130" fill="#0a0418" />
          <rect x="965" y="170" width="85" height="130" fill="none" stroke="#ff0080" strokeWidth="1" opacity="0.5" />
          
          <rect x="1070" y="130" width="70" height="170" fill="#0a0418" />
          <rect x="1070" y="130" width="70" height="170" fill="none" stroke="#bf5af2" strokeWidth="1" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

// Vice City Neon Sign Component - Static for performance
export function NeonSign({ 
  text, 
  color = "pink",
  className = "" 
}: { 
  text: string; 
  color?: "pink" | "cyan" | "purple" | "green";
  className?: string;
}) {
  const colorClasses = {
    pink: "text-[#ff0080] [text-shadow:0_0_10px_#ff0080]",
    cyan: "text-[#00ffff] [text-shadow:0_0_10px_#00ffff]",
    purple: "text-[#bf5af2] [text-shadow:0_0_10px_#bf5af2]",
    green: "text-[#c8ff00] [text-shadow:0_0_10px_#c8ff00]",
  };

  return (
    <span
      className={`font-bold tracking-wider ${colorClasses[color]} ${className}`}
      style={{ fontFamily: "'Orbitron', sans-serif" }}
    >
      {text}
    </span>
  );
}

// Vice City Sunset Gradient Background - Static for performance
export function ViceSunset({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Sunset gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            rgba(255, 170, 0, 0.25) 0%,
            rgba(255, 102, 0, 0.2) 15%,
            rgba(255, 0, 153, 0.15) 35%,
            rgba(204, 0, 255, 0.1) 55%,
            rgba(102, 0, 204, 0.08) 75%,
            transparent 100%)`
        }}
      />
      
      {/* Static Sun */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,170,0,0.7) 0%, rgba(255,102,0,0.5) 30%, rgba(255,0,153,0.2) 60%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(15px)',
        }}
      />
      
      {/* Horizontal lines through sun (synthwave style) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[12%] w-[180px] space-y-2 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="h-[2px] bg-gradient-to-r from-transparent via-[#ff0080] to-transparent"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// Vice City Synthwave Grid Floor - Static
export function SynthwaveGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, rgba(255, 0, 128, 0.08) 100%),
            repeating-linear-gradient(
              90deg,
              rgba(0, 255, 255, 0.1) 0px,
              rgba(0, 255, 255, 0.1) 1px,
              transparent 1px,
              transparent 60px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255, 0, 128, 0.08) 0px,
              rgba(255, 0, 128, 0.08) 1px,
              transparent 1px,
              transparent 40px
            )
          `,
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}

// Vice City Neon Road - Static for performance
export function NeonRoad({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none ${className}`}>
      {/* Road surface */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
      
      {/* Static center line */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 h-1"
        style={{
          width: '100%',
          background: 'repeating-linear-gradient(90deg, #ffff00 0px, #ffff00 30px, transparent 30px, transparent 50px)',
          boxShadow: '0 0 8px #ffff00',
        }}
      />
      
      {/* Side lines */}
      <div 
        className="absolute bottom-4 left-[10%] right-[10%] h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
          boxShadow: '0 0 4px #00ffff',
        }}
      />
      <div 
        className="absolute bottom-12 left-[10%] right-[10%] h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #ff0080, transparent)',
          boxShadow: '0 0 4px #ff0080',
        }}
      />
    </div>
  );
}

// Static Neon Border - No animation
export function NeonBorder({ 
  children, 
  className = "",
  color = "multi"
}: { 
  children: React.ReactNode;
  className?: string;
  color?: "pink" | "cyan" | "green" | "multi";
}) {
  const borderColors = {
    pink: "from-[#ff0080] via-[#ff0080] to-[#ff0080]",
    cyan: "from-[#00ffff] via-[#00ffff] to-[#00ffff]",
    green: "from-[#c8ff00] via-[#c8ff00] to-[#c8ff00]",
    multi: "from-[#ff0080] via-[#00ffff] to-[#bf5af2]",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute -inset-[2px] rounded-[inherit] bg-gradient-to-r ${borderColors[color]} opacity-60`}
      />
      <div className="relative bg-[#0a0418] rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
