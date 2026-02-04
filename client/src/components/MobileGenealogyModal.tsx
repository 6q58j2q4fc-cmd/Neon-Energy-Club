import { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Users, ChevronDown, ChevronUp, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: number;
  name: string;
  rank: string;
  position: "left" | "right" | "root";
  personalVolume: number;
  teamVolume: number;
  leftLeg?: TeamMember | null;
  rightLeg?: TeamMember | null;
  sponsorId?: number | null;
  joinDate?: string;
  isActive?: boolean;
}

interface GenealogyAPIData {
  distributor: {
    id: number;
    distributorCode: string;
    username: string | null;
    subdomain: string | null;
    rank: string;
    personalSales: number;
    teamSales: number;
    isActive: number;
  };
  tree: any[];
  totalDownline: number;
  depth: number;
}

interface MobileGenealogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  genealogyData?: GenealogyAPIData | null;
  distributorCode?: string;
}

const RANK_COLORS: Record<string, string> = {
  STARTER: "#9ca3af",
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
  DIAMOND: "#b9f2ff",
  CROWN: "#9d4edd",
};

const RANK_BADGES: Record<string, string> = {
  STARTER: "⭐",
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "💎",
  DIAMOND: "💠",
  CROWN: "👑",
};

function TreeNode({ 
  member, 
  level = 0, 
  onAddMember 
}: { 
  member: TeamMember | null; 
  level?: number;
  onAddMember?: (position: "left" | "right", parentId: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  if (!member) {
    return (
      <div className="flex flex-col items-center p-2">
        <div 
          className="w-20 h-20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onAddMember?.("left", 0)}
        >
          <span className="text-white/40 text-2xl">+</span>
        </div>
        <span className="text-xs text-white/40 mt-1">Available</span>
      </div>
    );
  }

  const hasChildren = member.leftLeg || member.rightLeg;
  const rankColor = RANK_COLORS[member.rank] || RANK_COLORS.STARTER;
  const rankBadge = RANK_BADGES[member.rank] || RANK_BADGES.STARTER;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div 
        className="relative p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 min-w-[140px] max-w-[160px] backdrop-blur-sm"
        style={{ borderColor: `${rankColor}40` }}
      >
        {/* Rank Badge */}
        <div 
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg"
          style={{ backgroundColor: rankColor }}
        >
          {rankBadge}
        </div>
        
        {/* Member Info */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-[#c8ff00]" />
          </div>
          <h4 className="font-semibold text-white text-sm truncate">{member.name}</h4>
          <p className="text-xs text-white/60 mt-0.5">{member.rank}</p>
          
          {/* Volume Stats */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            <div className="bg-white/5 rounded p-1">
              <span className="text-white/50">PV</span>
              <p className="text-[#c8ff00] font-medium">{member.personalVolume || 0}</p>
            </div>
            <div className="bg-white/5 rounded p-1">
              <span className="text-white/50">TV</span>
              <p className="text-[#c8ff00] font-medium">{member.teamVolume || 0}</p>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#c8ff00] text-black flex items-center justify-center shadow-lg hover:bg-[#b8ef00] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Children */}
      {isExpanded && (hasChildren || level < 3) && (
        <div className="mt-6 relative">
          {/* Connector Lines */}
          <div className="absolute top-0 left-1/2 w-px h-4 bg-white/20 -translate-x-1/2 -translate-y-4" />
          
          <div className="flex gap-4">
            {/* Left Leg */}
            <div className="relative">
              {(member.leftLeg || level < 3) && (
                <>
                  <div className="absolute top-0 left-1/2 w-px h-4 bg-white/20 -translate-x-1/2 -translate-y-4" />
                  <TreeNode 
                    member={member.leftLeg || null} 
                    level={level + 1}
                    onAddMember={onAddMember}
                  />
                </>
              )}
            </div>
            
            {/* Right Leg */}
            <div className="relative">
              {(member.rightLeg || level < 3) && (
                <>
                  <div className="absolute top-0 left-1/2 w-px h-4 bg-white/20 -translate-x-1/2 -translate-y-4" />
                  <TreeNode 
                    member={member.rightLeg || null} 
                    level={level + 1}
                    onAddMember={onAddMember}
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Horizontal Connector */}
          {(member.leftLeg || member.rightLeg || level < 3) && (
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-white/20 -translate-y-4" />
          )}
        </div>
      )}
    </div>
  );
}

export default function MobileGenealogyModal({ 
  isOpen, 
  onClose, 
  genealogyData,
  distributorCode 
}: MobileGenealogyModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Touch handlers for panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Transform API data to TeamMember format or create demo data
  const transformToTreeMember = (apiData: GenealogyAPIData | null | undefined): TeamMember => {
    if (!apiData) {
      return {
        id: 1,
        name: distributorCode || "You",
        rank: "STARTER",
        position: "root",
        personalVolume: 0,
        teamVolume: 0,
        leftLeg: null,
        rightLeg: null,
      };
    }
    
    // Transform tree array to left/right legs
    const leftLeg = apiData.tree.find((m: any) => m.position === 'left');
    const rightLeg = apiData.tree.find((m: any) => m.position === 'right');
    
    return {
      id: apiData.distributor.id,
      name: apiData.distributor.username || apiData.distributor.distributorCode,
      rank: apiData.distributor.rank.toUpperCase(),
      position: "root",
      personalVolume: apiData.distributor.personalSales || 0,
      teamVolume: apiData.distributor.teamSales || 0,
      leftLeg: leftLeg ? {
        id: leftLeg.id,
        name: leftLeg.username || leftLeg.distributorCode,
        rank: leftLeg.rank?.toUpperCase() || "STARTER",
        position: "left",
        personalVolume: leftLeg.personalSales || 0,
        teamVolume: leftLeg.teamSales || 0,
        leftLeg: null,
        rightLeg: null,
      } : null,
      rightLeg: rightLeg ? {
        id: rightLeg.id,
        name: rightLeg.username || rightLeg.distributorCode,
        rank: rightLeg.rank?.toUpperCase() || "STARTER",
        position: "right",
        personalVolume: rightLeg.personalSales || 0,
        teamVolume: rightLeg.teamSales || 0,
        leftLeg: null,
        rightLeg: null,
      } : null,
    };
  };
  
  const demoData: TeamMember = transformToTreeMember(genealogyData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c8ff00]" />
              Team Genealogy
            </h2>
            <p className="text-sm text-white/60">Binary tree structure</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetView}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Rank Legend */}
      <div className="absolute top-20 left-4 z-10 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <h3 className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-1">
          <Award className="w-3 h-3" /> Ranks
        </h3>
        <div className="space-y-1">
          {Object.entries(RANK_BADGES).slice(0, 4).map(([rank, badge]) => (
            <div key={rank} className="flex items-center gap-2 text-xs">
              <span>{badge}</span>
              <span className="text-white/60">{rank}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tree Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 pt-24 pb-20 overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="min-h-full flex items-start justify-center pt-8 transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center top',
          }}
        >
          <TreeNode member={demoData} level={0} />
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black to-transparent p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <TrendingUp className="w-5 h-5 text-[#c8ff00] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{demoData.personalVolume || 0}</p>
            <p className="text-xs text-white/60">Personal Volume</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <Users className="w-5 h-5 text-[#c8ff00] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{demoData.teamVolume || 0}</p>
            <p className="text-xs text-white/60">Team Volume</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <Award className="w-5 h-5 text-[#c8ff00] mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{demoData.rank}</p>
            <p className="text-xs text-white/60">Current Rank</p>
          </div>
        </div>
      </div>

      {/* Instructions Overlay (shows briefly) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center text-white/40 text-xs">
        <p>Drag to pan • Use buttons to zoom</p>
      </div>
    </div>
  );
}
