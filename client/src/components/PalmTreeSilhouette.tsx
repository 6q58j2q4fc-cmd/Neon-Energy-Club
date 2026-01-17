import { cn } from "@/lib/utils";

interface PalmTreeProps {
  className?: string;
  side?: "left" | "right";
}

export function PalmTreeSilhouette({ className, side = "left" }: PalmTreeProps) {
  const isRight = side === "right";
  
  return (
    <svg
      viewBox="0 0 200 400"
      className={cn("absolute bottom-0 pointer-events-none", className)}
      style={{ transform: isRight ? "scaleX(-1)" : undefined }}
      fill="currentColor"
    >
      {/* Palm Tree Trunk */}
      <path
        d="M95 400 L90 320 Q88 280 92 250 Q95 220 90 180 L85 180 Q80 220 82 250 Q78 280 80 320 L75 400 Z"
        opacity="0.9"
      />
      
      {/* Palm Fronds - Main */}
      <path
        d="M90 180 Q60 150 20 140 Q40 155 50 160 Q30 145 5 150 Q35 165 55 170 Q35 160 15 170 Q45 180 65 180 Q50 175 40 185 Q60 185 80 180 Z"
        opacity="0.85"
      />
      <path
        d="M90 180 Q70 130 40 100 Q55 125 65 140 Q45 110 25 90 Q50 130 70 150 Q50 125 35 110 Q60 145 80 165 Z"
        opacity="0.85"
      />
      <path
        d="M90 180 Q100 120 90 60 Q95 100 100 130 Q100 80 95 40 Q105 100 105 140 Q110 100 105 70 Q115 120 110 160 Z"
        opacity="0.85"
      />
      <path
        d="M90 180 Q130 130 170 110 Q145 135 130 150 Q160 125 185 115 Q150 145 125 165 Q155 145 175 140 Q140 165 115 175 Z"
        opacity="0.85"
      />
      <path
        d="M90 180 Q120 150 160 145 Q135 160 120 165 Q150 155 180 160 Q145 170 120 175 Q145 170 165 180 Q130 180 105 180 Z"
        opacity="0.85"
      />
      
      {/* Coconuts */}
      <circle cx="85" cy="175" r="6" opacity="0.9" />
      <circle cx="95" cy="178" r="5" opacity="0.9" />
      <circle cx="90" cy="185" r="5" opacity="0.9" />
    </svg>
  );
}

export function PalmTreeGroup({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Left Side Palm Trees */}
      <PalmTreeSilhouette 
        side="left" 
        className="left-0 h-[60%] text-black/40 z-10" 
      />
      <PalmTreeSilhouette 
        side="left" 
        className="left-[5%] h-[45%] text-black/30 z-5" 
      />
      
      {/* Right Side Palm Trees */}
      <PalmTreeSilhouette 
        side="right" 
        className="right-0 h-[55%] text-black/40 z-10" 
      />
      <PalmTreeSilhouette 
        side="right" 
        className="right-[8%] h-[40%] text-black/25 z-5" 
      />
    </div>
  );
}
