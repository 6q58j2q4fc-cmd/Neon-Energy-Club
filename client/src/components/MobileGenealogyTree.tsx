import { useState, useEffect, useRef, useCallback } from "react";
import { Users, UserPlus, ChevronDown, ChevronUp, Award, Star, Crown, Gem, Trophy, Zap, Target, Rocket, Shield, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Rank configuration with icons and colors
const RANK_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  STARTER: { icon: Star, color: "#c8ff00", bgColor: "bg-[#c8ff00]/20", label: "Starter" },
  BRONZE: { icon: Award, color: "#CD7F32", bgColor: "bg-[#CD7F32]/20", label: "Bronze" },
  SILVER: { icon: Shield, color: "#C0C0C0", bgColor: "bg-[#C0C0C0]/20", label: "Silver" },
  GOLD: { icon: Medal, color: "#FFD700", bgColor: "bg-[#FFD700]/20", label: "Gold" },
  PLATINUM: { icon: Gem, color: "#E5E4E2", bgColor: "bg-[#E5E4E2]/20", label: "Platinum" },
  DIAMOND: { icon: Crown, color: "#B9F2FF", bgColor: "bg-[#B9F2FF]/20", label: "Diamond" },
  EXECUTIVE: { icon: Trophy, color: "#9d4edd", bgColor: "bg-[#9d4edd]/20", label: "Executive" },
  PRESIDENTIAL: { icon: Rocket, color: "#FF6B6B", bgColor: "bg-[#FF6B6B]/20", label: "Presidential" },
};

interface TeamMember {
  id: string;
  name: string;
  rank: string;
  position: "left" | "right" | "root";
  personalVolume: number;
  teamVolume: number;
  leftChild?: TeamMember | null;
  rightChild?: TeamMember | null;
  isPlaceholder?: boolean;
}

// Convert API genealogy data to TeamMember format
function convertGenealogyToTeamMember(data: any, position: "left" | "right" | "root" = "root"): TeamMember | null {
  if (!data) return null;
  
  // Find left and right children from the children array
  const leftChild = data.children?.find((c: any) => c.placementPosition === "left");
  const rightChild = data.children?.find((c: any) => c.placementPosition === "right");
  
  return {
    id: data.distributorCode || data.id?.toString() || "UNKNOWN",
    name: data.name || data.username || "Team Member",
    rank: (data.rank || "starter").toUpperCase(),
    position,
    personalVolume: data.personalSales || data.monthlyPV || 0,
    teamVolume: data.teamSales || (data.leftLegVolume || 0) + (data.rightLegVolume || 0),
    leftChild: leftChild ? convertGenealogyToTeamMember(leftChild, "left") : null,
    rightChild: rightChild ? convertGenealogyToTeamMember(rightChild, "right") : null,
  };
}

interface MobileGenealogyTreeProps {
  rootMember?: TeamMember | null;
  genealogyData?: any; // Raw data from API
  onEnrollClick?: (position: "left" | "right", parentId: string) => void;
  isLoading?: boolean;
}

// Individual member card component
function MemberCard({ 
  member, 
  depth = 0,
  onEnrollClick,
  expanded,
  onToggleExpand
}: { 
  member: TeamMember; 
  depth?: number;
  onEnrollClick?: (position: "left" | "right", parentId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const rankConfig = RANK_CONFIG[member.rank] || RANK_CONFIG.STARTER;
  const RankIcon = rankConfig.icon;
  const hasChildren = member.leftChild || member.rightChild;
  
  if (member.isPlaceholder) {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={() => onEnrollClick?.(member.position as "left" | "right", member.id)}
          className="w-full max-w-[160px] p-3 rounded-xl border-2 border-dashed border-[#c8ff00]/30 bg-black/20 
                     flex flex-col items-center justify-center gap-2 min-h-[80px]
                     active:bg-[#c8ff00]/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#c8ff00]" />
          </div>
          <span className="text-xs text-[#c8ff00] font-medium">
            {member.position === "left" ? "Add Left" : "Add Right"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Member Card */}
      <div 
        className={`w-full max-w-[280px] rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 
                    backdrop-blur-sm overflow-hidden ${depth === 0 ? 'border-[#c8ff00]/50' : ''}`}
      >
        {/* Header with rank */}
        <div className={`px-3 py-2 ${rankConfig.bgColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <RankIcon className="w-4 h-4" style={{ color: rankConfig.color }} />
            <span className="text-xs font-bold" style={{ color: rankConfig.color }}>
              {rankConfig.label}
            </span>
          </div>
          {depth === 0 && (
            <span className="text-[10px] bg-[#c8ff00] text-black px-2 py-0.5 rounded-full font-bold">YOU</span>
          )}
        </div>
        
        {/* Member info */}
        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00]/20 to-[#9d4edd]/20 
                            flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{member.name}</p>
              <p className="text-white/50 text-xs truncate">{member.id}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-[10px] text-white/50 uppercase">Personal</p>
              <p className="text-sm font-bold text-[#c8ff00]">${member.personalVolume}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-[10px] text-white/50 uppercase">Team</p>
              <p className="text-sm font-bold text-[#9d4edd]">${member.teamVolume}</p>
            </div>
          </div>
          
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={onToggleExpand}
              className="w-full mt-3 py-2 rounded-lg bg-white/5 flex items-center justify-center gap-2
                         active:bg-white/10 transition-colors"
            >
              <span className="text-xs text-white/70">
                {expanded ? "Hide Team" : "Show Team"}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-white/70" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/70" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Children */}
      {expanded && hasChildren && (
        <div className="w-full mt-4">
          {/* Connection line */}
          <div className="flex justify-center mb-2">
            <div className="w-0.5 h-4 bg-gradient-to-b from-[#c8ff00]/50 to-transparent" />
          </div>
          
          {/* Horizontal connector */}
          <div className="flex justify-center mb-2">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#c8ff00]/30 to-transparent" />
          </div>
          
          {/* Children grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left child */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-[#c8ff00]/70 font-medium mb-2 uppercase">Left Leg</div>
              {member.leftChild ? (
                <MemberCardSimple 
                  member={member.leftChild} 
                  onEnrollClick={onEnrollClick}
                />
              ) : (
                <PlaceholderCard 
                  position="left" 
                  parentId={member.id}
                  onEnrollClick={onEnrollClick}
                />
              )}
            </div>
            
            {/* Right child */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-[#9d4edd]/70 font-medium mb-2 uppercase">Right Leg</div>
              {member.rightChild ? (
                <MemberCardSimple 
                  member={member.rightChild}
                  onEnrollClick={onEnrollClick}
                />
              ) : (
                <PlaceholderCard 
                  position="right" 
                  parentId={member.id}
                  onEnrollClick={onEnrollClick}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified member card for children
function MemberCardSimple({ 
  member,
  onEnrollClick
}: { 
  member: TeamMember;
  onEnrollClick?: (position: "left" | "right", parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rankConfig = RANK_CONFIG[member.rank] || RANK_CONFIG.STARTER;
  const RankIcon = rankConfig.icon;
  const hasChildren = member.leftChild || member.rightChild;
  
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        {/* Compact header */}
        <div className={`px-2 py-1.5 ${rankConfig.bgColor} flex items-center gap-1.5`}>
          <RankIcon className="w-3 h-3" style={{ color: rankConfig.color }} />
          <span className="text-[10px] font-bold" style={{ color: rankConfig.color }}>
            {rankConfig.label}
          </span>
        </div>
        
        {/* Member info */}
        <div className="p-2">
          <p className="text-white font-medium text-xs truncate">{member.name}</p>
          <p className="text-white/40 text-[10px] truncate">{member.id}</p>
          
          {/* Mini stats */}
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1 bg-white/5 rounded px-1.5 py-1 text-center">
              <p className="text-[8px] text-white/40">PV</p>
              <p className="text-[10px] font-bold text-[#c8ff00]">${member.personalVolume}</p>
            </div>
            <div className="flex-1 bg-white/5 rounded px-1.5 py-1 text-center">
              <p className="text-[8px] text-white/40">TV</p>
              <p className="text-[10px] font-bold text-[#9d4edd]">${member.teamVolume}</p>
            </div>
          </div>
          
          {/* Expand button */}
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 py-1.5 rounded bg-white/5 flex items-center justify-center gap-1
                         active:bg-white/10"
            >
              <span className="text-[10px] text-white/60">
                {expanded ? "Hide" : "View Team"}
              </span>
              {expanded ? (
                <ChevronUp className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronDown className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Nested children */}
      {expanded && hasChildren && (
        <div className="w-full mt-2 pl-2 border-l border-white/10">
          <div className="space-y-2">
            {member.leftChild && (
              <div>
                <div className="text-[8px] text-white/40 mb-1">LEFT</div>
                <MemberCardSimple member={member.leftChild} onEnrollClick={onEnrollClick} />
              </div>
            )}
            {member.rightChild && (
              <div>
                <div className="text-[8px] text-white/40 mb-1">RIGHT</div>
                <MemberCardSimple member={member.rightChild} onEnrollClick={onEnrollClick} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Placeholder card for empty positions
function PlaceholderCard({ 
  position, 
  parentId,
  onEnrollClick 
}: { 
  position: "left" | "right"; 
  parentId: string;
  onEnrollClick?: (position: "left" | "right", parentId: string) => void;
}) {
  return (
    <button
      onClick={() => onEnrollClick?.(position, parentId)}
      className="w-full rounded-xl border-2 border-dashed border-white/20 bg-black/20 
                 p-3 flex flex-col items-center justify-center gap-2 min-h-[80px]
                 active:bg-white/5 active:border-[#c8ff00]/50 transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
        <UserPlus className="w-4 h-4 text-white/40" />
      </div>
      <span className="text-[10px] text-white/40 font-medium">
        Available
      </span>
    </button>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 p-4 animate-pulse">
      <div className="w-full max-w-[280px] h-40 rounded-xl bg-white/10" />
      <div className="w-full flex justify-center gap-4">
        <div className="w-32 h-24 rounded-xl bg-white/5" />
        <div className="w-32 h-24 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

// Main component
export function MobileGenealogyTree({ 
  rootMember, 
  genealogyData,
  onEnrollClick,
  isLoading = false
}: MobileGenealogyTreeProps) {
  const [expanded, setExpanded] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  
  // Convert genealogyData to rootMember format if provided
  const effectiveRootMember = rootMember || (genealogyData ? convertGenealogyToTeamMember({
    ...genealogyData,
    children: genealogyData.tree || genealogyData.children || []
  }) : null);
  
  // Pinch-to-zoom handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = distance / lastTouchDistance.current;
      
      setScale(prev => Math.min(Math.max(prev * delta, 0.5), 2));
      lastTouchDistance.current = distance;
    }
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full min-h-[300px] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c8ff00]" />
            My Team Tree
          </h3>
          <p className="text-sm text-white/50 mt-1">Loading your team structure...</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }
  
  if (!effectiveRootMember) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Team Data</h3>
        <p className="text-sm text-white/50 text-center">
          Your team structure will appear here once you start building your network.
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-[300px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c8ff00]" />
              My Team Tree
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Pinch to zoom • Tap to expand
            </p>
          </div>
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 active:bg-white/20"
            >
              −
            </button>
            <span className="text-xs text-white/50 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(s + 0.2, 2))}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 active:bg-white/20"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Rank Legend */}
      <div className="p-3 border-b border-white/5 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {Object.entries(RANK_CONFIG).slice(0, 4).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div 
                key={key}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor}`}
              >
                <Icon className="w-3 h-3" style={{ color: config.color }} />
                <span className="text-[10px] font-medium" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tree Content with pinch-to-zoom */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-auto touch-pan-x touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.1s ease-out' }}>
            <MemberCard 
              member={effectiveRootMember}
              depth={0}
              onEnrollClick={onEnrollClick}
              expanded={expanded}
              onToggleExpand={() => setExpanded(!expanded)}
            />
          </div>
        </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-t border-white/10 bg-black/60">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-[#c8ff00]/30 text-[#c8ff00] text-sm"
            onClick={() => onEnrollClick?.("left", effectiveRootMember.id)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Left
          </Button>
          <Button
            variant="outline"
            className="border-[#9d4edd]/30 text-[#9d4edd] text-sm"
            onClick={() => onEnrollClick?.("right", effectiveRootMember.id)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Right
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileGenealogyTree;
