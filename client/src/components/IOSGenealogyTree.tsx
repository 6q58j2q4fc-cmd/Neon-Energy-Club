import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  ChevronDown, 
  ChevronUp,
  Star,
  Award,
  Crown,
  Gem,
  Zap
} from "lucide-react";

// Simple rank badge component
function RankBadge({ rank }: { rank: string }) {
  const rankConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    STARTER: { color: "#c8ff00", icon: <Star className="w-3 h-3" />, label: "Starter" },
    BRONZE: { color: "#cd7f32", icon: <Award className="w-3 h-3" />, label: "Bronze" },
    SILVER: { color: "#c0c0c0", icon: <Award className="w-3 h-3" />, label: "Silver" },
    GOLD: { color: "#ffd700", icon: <Crown className="w-3 h-3" />, label: "Gold" },
    PLATINUM: { color: "#e5e4e2", icon: <Gem className="w-3 h-3" />, label: "Platinum" },
    DIAMOND: { color: "#b9f2ff", icon: <Gem className="w-3 h-3" />, label: "Diamond" },
    EXECUTIVE: { color: "#ff6b6b", icon: <Zap className="w-3 h-3" />, label: "Executive" },
  };
  
  const config = rankConfig[rank?.toUpperCase()] || rankConfig.STARTER;
  
  return (
    <Badge 
      className="text-xs px-2 py-0.5 flex items-center gap-1"
      style={{ backgroundColor: `${config.color}20`, color: config.color, borderColor: config.color }}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

// Team member card component
function TeamMemberCard({ 
  member, 
  level, 
  isExpanded, 
  onToggle,
  hasChildren 
}: { 
  member: any; 
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}) {
  const levelColors = [
    "border-[#c8ff00]", // Level 0 - You
    "border-blue-500",  // Level 1
    "border-purple-500", // Level 2
    "border-pink-500",  // Level 3
    "border-orange-500", // Level 4
    "border-cyan-500",  // Level 5
  ];
  
  const borderColor = levelColors[Math.min(level, levelColors.length - 1)];
  
  return (
    <Card className={`bg-[#0a0a0a] ${borderColor} border-l-4 mb-2`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
              style={{ backgroundColor: level === 0 ? "#c8ff00" : "#333" }}
            >
              {level === 0 ? "YOU" : member.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                {level === 0 ? "You (Root)" : member.name || "Team Member"}
              </div>
              <div className="text-xs text-gray-400">
                {member.distributorCode || member.id || "N/A"}
              </div>
              <RankBadge rank={member.rank || "STARTER"} />
            </div>
          </div>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-[#c8ff00]"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
        
        {/* Stats row */}
        <div className="flex gap-4 mt-2 text-xs">
          <div className="text-gray-400">
            <span className="text-[#c8ff00] font-semibold">${member.personalVolume || 0}</span> PV
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">${member.teamVolume || 0}</span> TV
          </div>
          <div className="text-gray-400">
            <span className="text-purple-400 font-semibold">{member.directCount || 0}</span> Direct
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty position card
function EmptyPositionCard({ position, parentId, onEnroll }: { position: string; parentId: string; onEnroll: () => void }) {
  return (
    <Card className="bg-[#0a0a0a] border-dashed border-gray-600 mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
              <UserPlus className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Empty {position} Position</div>
              <div className="text-xs text-gray-600">Available for enrollment</div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onEnroll}
            className="bg-[#c8ff00] text-black hover:bg-[#a8df00]"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Enroll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface IOSGenealogyTreeProps {
  genealogyData?: any;
  distributorCode?: string;
  distributorRank?: string;
  personalVolume?: number;
  teamVolume?: number;
  isLoading?: boolean;
  onEnrollClick?: (position: string, parentId: string) => void;
}

export default function IOSGenealogyTree({
  genealogyData,
  distributorCode = "DIST001",
  distributorRank = "STARTER",
  personalVolume = 0,
  teamVolume = 0,
  isLoading = false,
  onEnrollClick
}: IOSGenealogyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]));
  
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };
  
  // Transform genealogy data to flat list with levels
  const transformToFlatList = (data: any, level: number = 0): any[] => {
    if (!data) return [];
    
    const result: any[] = [];
    
    // Add current node
    result.push({
      ...data,
      level,
      id: data.distributorCode || data.id || `node-${level}`,
      hasChildren: !!(data.leftChild || data.rightChild || data.children?.length)
    });
    
    // Add children
    if (data.leftChild) {
      result.push(...transformToFlatList(data.leftChild, level + 1));
    }
    if (data.rightChild) {
      result.push(...transformToFlatList(data.rightChild, level + 1));
    }
    if (data.children) {
      data.children.forEach((child: any) => {
        result.push(...transformToFlatList(child, level + 1));
      });
    }
    
    return result;
  };
  
  // Build the tree structure
  const rootMember = {
    id: "root",
    distributorCode,
    name: "You",
    rank: distributorRank,
    personalVolume,
    teamVolume,
    directCount: genealogyData?.directCount || 0,
    leftChild: genealogyData?.leftChild,
    rightChild: genealogyData?.rightChild,
    children: genealogyData?.children
  };
  
  const flatList = transformToFlatList(genealogyData || rootMember);
  
  if (isLoading) {
    return (
      <div className="p-4 bg-[#0a0a0a] rounded-lg min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8ff00] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your team tree...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-[#0a0a0a] rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#c8ff00]" />
          <h3 className="font-semibold text-white">Your Team Tree</h3>
        </div>
        <Badge className="bg-[#c8ff00]/20 text-[#c8ff00]">
          {flatList.length} Members
        </Badge>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#c8ff00]"></div>
          <span className="text-gray-400">You</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Level 1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-400">Level 2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span className="text-gray-400">Level 3+</span>
        </div>
      </div>
      
      {/* Tree List */}
      <div className="space-y-2">
        {/* Root member (You) */}
        <TeamMemberCard
          member={rootMember}
          level={0}
          isExpanded={expandedNodes.has("root")}
          onToggle={() => toggleNode("root")}
          hasChildren={!!(rootMember.leftChild || rootMember.rightChild || rootMember.children?.length)}
        />
        
        {/* Show children if expanded */}
        {expandedNodes.has("root") && (
          <div className="ml-4 border-l-2 border-gray-700 pl-2">
            {/* Left position */}
            {genealogyData?.leftChild ? (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">← Left Leg</div>
                <TeamMemberCard
                  member={genealogyData.leftChild}
                  level={1}
                  isExpanded={expandedNodes.has(genealogyData.leftChild.id || "left")}
                  onToggle={() => toggleNode(genealogyData.leftChild.id || "left")}
                  hasChildren={!!(genealogyData.leftChild.leftChild || genealogyData.leftChild.rightChild)}
                />
              </div>
            ) : (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">← Left Leg</div>
                <EmptyPositionCard
                  position="Left"
                  parentId={distributorCode}
                  onEnroll={() => onEnrollClick?.("left", distributorCode)}
                />
              </div>
            )}
            
            {/* Right position */}
            {genealogyData?.rightChild ? (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">→ Right Leg</div>
                <TeamMemberCard
                  member={genealogyData.rightChild}
                  level={1}
                  isExpanded={expandedNodes.has(genealogyData.rightChild.id || "right")}
                  onToggle={() => toggleNode(genealogyData.rightChild.id || "right")}
                  hasChildren={!!(genealogyData.rightChild.leftChild || genealogyData.rightChild.rightChild)}
                />
              </div>
            ) : (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">→ Right Leg</div>
                <EmptyPositionCard
                  position="Right"
                  parentId={distributorCode}
                  onEnroll={() => onEnrollClick?.("right", distributorCode)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="mt-4 p-3 bg-[#c8ff00]/10 rounded-lg border border-[#c8ff00]/20">
        <p className="text-xs text-gray-400">
          <strong className="text-[#c8ff00]">Tip:</strong> Tap on a team member to expand and see their downline. 
          Use the "Enroll" button to add new team members to empty positions.
        </p>
      </div>
    </div>
  );
}
