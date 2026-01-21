import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Award, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, DollarSign, Activity, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TreeNode {
  id: number;
  distributorCode: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  rank: string;
  personalSales: number;
  teamSales: number;
  leftLegVolume: number;
  rightLegVolume: number;
  monthlyPV: number;
  isActive: number;
  placementPosition?: string | null;
  depth: number;
  children: TreeNode[];
  childCount: number;
}

interface GenealogyData {
  distributor: {
    id: number;
    distributorCode: string;
    username?: string | null;
    subdomain?: string | null;
    rank: string;
    personalSales: number;
    teamSales: number;
    leftLegVolume: number;
    rightLegVolume: number;
    monthlyPV: number;
    isActive: number;
  };
  tree: TreeNode[];
  totalDownline: number;
  depth: number;
}

interface GenealogyTreeProps {
  rootDistributor?: any;
  team?: any[];
  useApi?: boolean;
}

// Rank colors for visualization
const RANK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  starter: { bg: "rgba(200, 255, 0, 0.15)", border: "#c8ff00", text: "#c8ff00" },
  bronze: { bg: "rgba(205, 127, 50, 0.2)", border: "#cd7f32", text: "#cd7f32" },
  silver: { bg: "rgba(192, 192, 192, 0.2)", border: "#c0c0c0", text: "#c0c0c0" },
  gold: { bg: "rgba(255, 215, 0, 0.2)", border: "#ffd700", text: "#ffd700" },
  platinum: { bg: "rgba(229, 228, 226, 0.2)", border: "#e5e4e2", text: "#e5e4e2" },
  diamond: { bg: "rgba(185, 242, 255, 0.2)", border: "#b9f2ff", text: "#b9f2ff" },
  executive: { bg: "rgba(138, 43, 226, 0.2)", border: "#8a2be2", text: "#8a2be2" },
  presidential: { bg: "rgba(255, 0, 128, 0.2)", border: "#ff0080", text: "#ff0080" },
  ambassador: { bg: "rgba(255, 69, 0, 0.2)", border: "#ff4500", text: "#ff4500" },
  crown: { bg: "rgba(255, 215, 0, 0.3)", border: "#ffd700", text: "#ffd700" },
};

// Tree Node Component
function TreeNodeCard({ 
  node, 
  expanded, 
  onToggle, 
  onSelect,
  isSelected,
  level = 0 
}: { 
  node: TreeNode; 
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  level?: number;
}) {
  const colors = RANK_COLORS[node.rank] || RANK_COLORS.starter;
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
        onClick={onSelect}
      >
        <div 
          className={`p-3 rounded-lg border-2 min-w-[160px] ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black ring-[#c8ff00]' : ''}`}
          style={{ 
            backgroundColor: colors.bg, 
            borderColor: colors.border 
          }}
        >
          {/* Active indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${node.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          
          {/* Name/Code */}
          <div className="text-center">
            <div className="font-bold text-white text-sm truncate max-w-[140px]">
              {node.name || node.username || node.distributorCode.substring(0, 10)}
            </div>
            <div className="text-xs text-gray-400">{node.distributorCode.substring(0, 8)}</div>
          </div>
          
          {/* Rank Badge */}
          <div className="flex justify-center mt-1">
            <Badge 
              variant="outline" 
              className="text-[10px] uppercase"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              {node.rank}
            </Badge>
          </div>
          
          {/* Stats */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
            <div className="text-center">
              <div className="text-gray-500">PV</div>
              <div className="text-white font-medium">{node.monthlyPV}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Team</div>
              <div className="text-white font-medium">{node.childCount}</div>
            </div>
          </div>
          
          {/* Binary Legs */}
          <div className="mt-1 flex justify-between text-[9px]">
            <div className="text-blue-400">L: ${(node.leftLegVolume / 100).toFixed(0)}</div>
            <div className="text-purple-400">R: ${(node.rightLegVolume / 100).toFixed(0)}</div>
          </div>
        </div>
        
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#c8ff00] text-black flex items-center justify-center hover:bg-[#a8d600] transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// Recursive Tree View
function TreeLevel({ 
  nodes, 
  expandedNodes, 
  toggleNode, 
  selectedNode, 
  setSelectedNode,
  level = 0 
}: {
  nodes: TreeNode[];
  expandedNodes: Set<number>;
  toggleNode: (id: number) => void;
  selectedNode: TreeNode | null;
  setSelectedNode: (node: TreeNode) => void;
  level?: number;
}) {
  if (!nodes || nodes.length === 0) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 flex-wrap justify-center">
        {nodes.map((node) => {
          const isExpanded = expandedNodes.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <div key={node.id} className="flex flex-col items-center">
              <TreeNodeCard
                node={node}
                expanded={isExpanded}
                onToggle={() => toggleNode(node.id)}
                onSelect={() => setSelectedNode(node)}
                isSelected={selectedNode?.id === node.id}
                level={level}
              />
              
              {/* Connection Line */}
              {hasChildren && isExpanded && (
                <div className="w-px h-8 bg-[#c8ff00]/30 mt-4" />
              )}
              
              {/* Children */}
              {hasChildren && isExpanded && (
                <div className="mt-2">
                  <TreeLevel
                    nodes={node.children}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GenealogyTree({ rootDistributor, team, useApi = true }: GenealogyTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  
  // Fetch genealogy data from API
  const { data: genealogyData, isLoading } = trpc.distributor.genealogy.useQuery(
    { depth: 5 },
    { enabled: useApi }
  );
  
  // Fetch rank progress
  const { data: rankProgress } = trpc.distributor.rankProgress.useQuery(
    undefined,
    { enabled: useApi }
  );
  
  // Fetch activity status
  const { data: activityStatus } = trpc.distributor.activityStatus.useQuery(
    undefined,
    { enabled: useApi }
  );
  
  const toggleNode = useCallback((id: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  
  const expandAll = useCallback(() => {
    if (!genealogyData?.tree) return;
    const allIds = new Set<number>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(genealogyData.tree);
    setExpandedNodes(allIds);
  }, [genealogyData]);
  
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  // Build tree from props if not using API
  const treeData = useApi ? genealogyData : (() => {
    if (!rootDistributor) return null;
    const buildTree = (distributor: any, teamMembers: any[]): TreeNode => {
      const children = teamMembers
        .filter((member) => member.sponsorId === distributor.id)
        .map((child) => buildTree(child, teamMembers));
      return {
        id: distributor.id,
        distributorCode: distributor.distributorCode,
        username: distributor.username,
        name: distributor.name,
        email: distributor.email,
        rank: distributor.rank,
        personalSales: distributor.personalSales || 0,
        teamSales: distributor.teamSales || 0,
        leftLegVolume: distributor.leftLegVolume || 0,
        rightLegVolume: distributor.rightLegVolume || 0,
        monthlyPV: distributor.monthlyPV || 0,
        isActive: distributor.isActive || 0,
        placementPosition: distributor.placementPosition,
        depth: 0,
        children,
        childCount: children.length,
      };
    };
    return {
      distributor: rootDistributor,
      tree: team ? [buildTree(rootDistributor, team)] : [],
      totalDownline: team?.length || 0,
      depth: 5,
    };
  })();

  if (isLoading) {
    return (
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#c8ff00]/20 rounded w-48 mx-auto" />
            <div className="h-64 bg-[#c8ff00]/10 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Status Card */}
      {activityStatus && (
        <Card className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border-[#c8ff00]/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#c8ff00]" />
                Activity Status
              </span>
              <Badge variant={activityStatus.isActive ? "default" : "destructive"} className={activityStatus.isActive ? "bg-green-500" : ""}>
                {activityStatus.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Monthly PV Requirement */}
              <div className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Monthly PV</span>
                  <Badge variant={activityStatus.requirements.monthlyPV.met ? "default" : "outline"} className={activityStatus.requirements.monthlyPV.met ? "bg-green-500/20 text-green-400 border-green-500" : "border-red-500 text-red-400"}>
                    {activityStatus.requirements.monthlyPV.met ? "✓ Met" : "Not Met"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white">
                  {activityStatus.requirements.monthlyPV.current} / {activityStatus.requirements.monthlyPV.required} PV
                </div>
                <Progress 
                  value={Math.min(100, (activityStatus.requirements.monthlyPV.current / activityStatus.requirements.monthlyPV.required) * 100)} 
                  className="h-2 mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">{activityStatus.requirements.monthlyPV.description}</p>
              </div>
              
              {/* Active Downline Requirement */}
              <div className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Active Downline</span>
                  <Badge variant={activityStatus.requirements.activeDownline.met ? "default" : "outline"} className={activityStatus.requirements.activeDownline.met ? "bg-green-500/20 text-green-400 border-green-500" : "border-red-500 text-red-400"}>
                    {activityStatus.requirements.activeDownline.met ? "✓ Met" : "Not Met"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white">
                  {activityStatus.requirements.activeDownline.current} / {activityStatus.requirements.activeDownline.required}
                </div>
                <Progress 
                  value={Math.min(100, (activityStatus.requirements.activeDownline.current / activityStatus.requirements.activeDownline.required) * 100)} 
                  className="h-2 mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">{activityStatus.requirements.activeDownline.description}</p>
              </div>
            </div>
            
            {/* Commission Eligibility */}
            <div className="mt-4 p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Commission Eligibility</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(activityStatus.commissionEligibility).map(([key, eligible]) => (
                  <div key={key} className={`p-2 rounded text-center text-xs ${eligible ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className={eligible ? 'text-green-400' : 'text-red-400'}>
                      {eligible ? '✓' : '✗'}
                    </div>
                    <div className="text-gray-400 mt-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Rank Progress Card */}
      {rankProgress && (
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#c8ff00]" />
              Rank Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <Badge 
                  className="text-lg px-4 py-2"
                  style={{ 
                    backgroundColor: RANK_COLORS[rankProgress.currentRank.key]?.bg || RANK_COLORS.starter.bg,
                    borderColor: RANK_COLORS[rankProgress.currentRank.key]?.border || RANK_COLORS.starter.border,
                    color: RANK_COLORS[rankProgress.currentRank.key]?.text || RANK_COLORS.starter.text,
                  }}
                >
                  {rankProgress.currentRank.key.toUpperCase()}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">Current Rank</div>
              </div>
              {rankProgress.nextRank && (
                <>
                  <div className="text-[#c8ff00]">→</div>
                  <div className="text-center">
                    <Badge 
                      variant="outline"
                      className="text-lg px-4 py-2"
                      style={{ 
                        borderColor: RANK_COLORS[rankProgress.nextRank.key]?.border || RANK_COLORS.starter.border,
                        color: RANK_COLORS[rankProgress.nextRank.key]?.text || RANK_COLORS.starter.text,
                      }}
                    >
                      {rankProgress.nextRank.key.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">Next Rank</div>
                  </div>
                </>
              )}
            </div>
            
            {rankProgress.nextRank && (
              <div className="space-y-4">
                {/* Personal PV Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Personal PV</span>
                    <span className="text-white">{rankProgress.progress.personalPV.current} / {rankProgress.progress.personalPV.required}</span>
                  </div>
                  <Progress value={rankProgress.progress.personalPV.percentage} className="h-2" />
                </div>
                
                {/* Team PV Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Team PV</span>
                    <span className="text-white">${(rankProgress.progress.teamPV.current / 100).toLocaleString()} / ${(rankProgress.progress.teamPV.required / 100).toLocaleString()}</span>
                  </div>
                  <Progress value={rankProgress.progress.teamPV.percentage} className="h-2" />
                </div>
                
                {/* Leg Volume Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Lesser Leg Volume</span>
                    <span className="text-white">${(rankProgress.progress.legVolume.current / 100).toLocaleString()} / ${(rankProgress.progress.legVolume.required / 100).toLocaleString()}</span>
                  </div>
                  <Progress value={rankProgress.progress.legVolume.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Left: ${(rankProgress.progress.legVolume.leftLeg / 100).toLocaleString()}</span>
                    <span>Right: ${(rankProgress.progress.legVolume.rightLeg / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Genealogy Tree */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c8ff00]" />
              Genealogy Tree
              {treeData && (
                <Badge variant="outline" className="ml-2 border-[#c8ff00]/50 text-[#c8ff00]">
                  {treeData.totalDownline} Members
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={expandAll} className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10">
                <Maximize2 className="w-4 h-4 mr-1" /> Expand All
              </Button>
              <Button size="sm" variant="outline" onClick={collapseAll} className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10">
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tree Visualization */}
          <div className="relative min-h-[400px] overflow-auto p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
            {treeData?.tree && treeData.tree.length > 0 ? (
              <TreeLevel
                nodes={treeData.tree}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Users className="w-16 h-16 mb-4 opacity-30" />
                <p>No team members yet</p>
                <p className="text-sm">Start building your team to see your genealogy tree</p>
              </div>
            )}
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg p-3 space-y-1">
              <div className="text-xs font-bold text-[#c8ff00] mb-2">RANKS</div>
              {Object.entries(RANK_COLORS).slice(0, 6).map(([rank, colors]) => (
                <div key={rank} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                  />
                  <span className="text-gray-300 capitalize">{rank}</span>
                </div>
              ))}
              <div className="border-t border-[#c8ff00]/20 pt-2 mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-300">Active</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-300">Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-[#0a0a0a] border-[#c8ff00]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Distributor Details</span>
              <Badge 
                style={{ 
                  backgroundColor: RANK_COLORS[selectedNode.rank]?.bg,
                  borderColor: RANK_COLORS[selectedNode.rank]?.border,
                  color: RANK_COLORS[selectedNode.rank]?.text,
                }}
              >
                {selectedNode.rank.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Name</div>
                <div className="text-xl font-bold text-white">{selectedNode.name || selectedNode.username || 'N/A'}</div>
                <div className="text-xs text-gray-500">{selectedNode.distributorCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Monthly PV</div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold">{selectedNode.monthlyPV}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Personal Sales</div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold">
                    ${((selectedNode.personalSales || 0) / 100).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Direct Team</div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold">{selectedNode.childCount}</span>
                </div>
              </div>
            </div>
            
            {/* Binary Leg Volumes */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-sm text-blue-400 mb-1">Left Leg Volume</div>
                <div className="text-2xl font-bold text-white">
                  ${((selectedNode.leftLegVolume || 0) / 100).toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="text-sm text-purple-400 mb-1">Right Leg Volume</div>
                <div className="text-2xl font-bold text-white">
                  ${((selectedNode.rightLegVolume || 0) / 100).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Status */}
            <div className="mt-4 flex items-center gap-4">
              <Badge variant={selectedNode.isActive ? "default" : "destructive"} className={selectedNode.isActive ? "bg-green-500" : ""}>
                {selectedNode.isActive ? "Active" : "Inactive"}
              </Badge>
              {selectedNode.placementPosition && (
                <Badge variant="outline" className="border-[#c8ff00]/50 text-[#c8ff00]">
                  Placement: {selectedNode.placementPosition.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
