import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Award, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, DollarSign, Activity, Target, Star } from "lucide-react";
import { RankBadge, RankIcon, RankProgress, RANK_CONFIG } from "@/components/RankBadge";
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
  showTutorial?: boolean;
}

// Sample data for tutorial mode
const SAMPLE_TREE_DATA: GenealogyData = {
  distributor: {
    id: 1,
    distributorCode: "NEON-001",
    username: "you",
    subdomain: "yoursite",
    rank: "gold",
    personalSales: 250000,
    teamSales: 1500000,
    leftLegVolume: 750000,
    rightLegVolume: 650000,
    monthlyPV: 500,
    isActive: 1,
  },
  tree: [
    {
      id: 2,
      distributorCode: "NEON-002",
      username: "sarah_j",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      rank: "silver",
      personalSales: 150000,
      teamSales: 450000,
      leftLegVolume: 200000,
      rightLegVolume: 180000,
      monthlyPV: 300,
      isActive: 1,
      placementPosition: "left",
      depth: 1,
      childCount: 2,
      children: [
        {
          id: 4,
          distributorCode: "NEON-004",
          username: "mike_t",
          name: "Mike Thompson",
          email: "mike@example.com",
          rank: "bronze",
          personalSales: 75000,
          teamSales: 120000,
          leftLegVolume: 50000,
          rightLegVolume: 45000,
          monthlyPV: 150,
          isActive: 1,
          placementPosition: "left",
          depth: 2,
          childCount: 1,
          children: [
            {
              id: 6,
              distributorCode: "NEON-006",
              username: "lisa_m",
              name: "Lisa Martinez",
              email: "lisa@example.com",
              rank: "starter",
              personalSales: 25000,
              teamSales: 25000,
              leftLegVolume: 0,
              rightLegVolume: 0,
              monthlyPV: 50,
              isActive: 1,
              placementPosition: "left",
              depth: 3,
              childCount: 0,
              children: [],
            },
          ],
        },
        {
          id: 5,
          distributorCode: "NEON-005",
          username: "emma_w",
          name: "Emma Wilson",
          email: "emma@example.com",
          rank: "bronze",
          personalSales: 80000,
          teamSales: 80000,
          leftLegVolume: 0,
          rightLegVolume: 0,
          monthlyPV: 160,
          isActive: 1,
          placementPosition: "right",
          depth: 2,
          childCount: 0,
          children: [],
        },
      ],
    },
    {
      id: 3,
      distributorCode: "NEON-003",
      username: "john_d",
      name: "John Davis",
      email: "john@example.com",
      rank: "gold",
      personalSales: 200000,
      teamSales: 600000,
      leftLegVolume: 300000,
      rightLegVolume: 250000,
      monthlyPV: 400,
      isActive: 1,
      placementPosition: "right",
      depth: 1,
      childCount: 2,
      children: [
        {
          id: 7,
          distributorCode: "NEON-007",
          username: "alex_b",
          name: "Alex Brown",
          email: "alex@example.com",
          rank: "silver",
          personalSales: 120000,
          teamSales: 200000,
          leftLegVolume: 80000,
          rightLegVolume: 70000,
          monthlyPV: 240,
          isActive: 1,
          placementPosition: "left",
          depth: 2,
          childCount: 0,
          children: [],
        },
        {
          id: 8,
          distributorCode: "NEON-008",
          username: "chris_l",
          name: "Chris Lee",
          email: "chris@example.com",
          rank: "bronze",
          personalSales: 60000,
          teamSales: 60000,
          leftLegVolume: 0,
          rightLegVolume: 0,
          monthlyPV: 120,
          isActive: 0,
          placementPosition: "right",
          depth: 2,
          childCount: 0,
          children: [],
        },
      ],
    },
  ],
  totalDownline: 7,
  depth: 3,
};

// Rank colors for visualization - consistent with compensation plan PDF
const RANK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  starter: { bg: "rgba(200, 255, 0, 0.15)", border: "#c8ff00", text: "#c8ff00" },
  bronze: { bg: "rgba(205, 127, 50, 0.2)", border: "#cd7f32", text: "#cd7f32" },
  silver: { bg: "rgba(192, 192, 192, 0.2)", border: "#c0c0c0", text: "#c0c0c0" },
  gold: { bg: "rgba(255, 215, 0, 0.2)", border: "#ffd700", text: "#ffd700" },
  platinum: { bg: "rgba(229, 228, 226, 0.2)", border: "#e5e4e2", text: "#e5e4e2" },
  diamond: { bg: "rgba(185, 242, 255, 0.2)", border: "#b9f2ff", text: "#b9f2ff" },
  crown_diamond: { bg: "rgba(138, 43, 226, 0.2)", border: "#8a2be2", text: "#8a2be2" },
  royal_diamond: { bg: "rgba(255, 0, 128, 0.2)", border: "#ff0080", text: "#ff0080" },
};

// Empty Position Placeholder Component
function EmptyPositionCard({ 
  position, 
  parentCode,
  onEnroll 
}: { 
  position: 'left' | 'right';
  parentCode: string;
  onEnroll: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative cursor-pointer transition-all duration-200 hover:scale-105 group"
        onClick={onEnroll}
      >
        <div 
          className="p-2 sm:p-3 rounded-lg border-2 border-dashed min-w-[120px] sm:min-w-[160px] bg-black/30 border-[#c8ff00]/30 hover:border-[#c8ff00] hover:bg-[#c8ff00]/10 transition-all"
        >
          {/* Position indicator */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black rounded text-[10px] text-gray-400 border border-gray-700">
            {position.toUpperCase()}
          </div>
          
          {/* Empty state */}
          <div className="text-center py-2 sm:py-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto rounded-full bg-[#c8ff00]/10 border-2 border-dashed border-[#c8ff00]/30 flex items-center justify-center mb-2 group-hover:border-[#c8ff00] group-hover:bg-[#c8ff00]/20 transition-all">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-[#c8ff00]/50 group-hover:text-[#c8ff00]" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-400 group-hover:text-[#c8ff00]">
              Available Position
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Under {parentCode}
            </div>
            <div className="mt-2 text-xs text-[#c8ff00] opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Enroll
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree Node Component
function TreeNodeCard({ 
  node, 
  expanded, 
  onToggle, 
  onSelect,
  isSelected,
  level = 0,
  showEmptyPositions = true,
  onEnrollPosition
}: { 
  node: TreeNode; 
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  level?: number;
  showEmptyPositions?: boolean;
  onEnrollPosition?: (parentCode: string, position: 'left' | 'right') => void;
}) {
  const colors = RANK_COLORS[node.rank] || RANK_COLORS.starter;
  const hasChildren = node.children && node.children.length > 0;
  
  // Determine which positions are filled
  const leftChild = node.children?.find(c => c.placementPosition === 'left');
  const rightChild = node.children?.find(c => c.placementPosition === 'right');
  const hasEmptyLeft = !leftChild && showEmptyPositions;
  const hasEmptyRight = !rightChild && showEmptyPositions;
  const showExpander = hasChildren || (showEmptyPositions && (!leftChild || !rightChild));
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
        onClick={onSelect}
      >
        <div 
          className={`p-2 sm:p-3 rounded-lg border-2 min-w-[120px] sm:min-w-[160px] ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black ring-[#c8ff00]' : ''}`}
          style={{ 
            backgroundColor: colors.bg, 
            borderColor: colors.border 
          }}
        >
          {/* Active indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${node.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          
          {/* Unique Distributor ID Badge */}
          <div className="absolute -top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-mono text-[#c8ff00] border border-[#c8ff00]/30">
            ID: {node.distributorCode}
          </div>
          
          {/* Name/Code */}
          <div className="text-center mt-2">
            <div className="font-bold text-white text-sm truncate max-w-[140px]">
              {node.name || node.username || 'Member'}
            </div>
            <div className="text-xs text-gray-400">@{node.username || node.distributorCode.substring(5, 10)}</div>
          </div>
          
          {/* Rank Badge with Icon */}
          <div className="flex justify-center mt-1">
            <RankBadge rank={node.rank} size="sm" showTooltip={true} />
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
        {showExpander && (
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
  level = 0,
  showEmptyPositions = true,
  onEnrollPosition
}: {
  nodes: TreeNode[];
  expandedNodes: Set<number>;
  toggleNode: (id: number) => void;
  selectedNode: TreeNode | null;
  setSelectedNode: (node: TreeNode) => void;
  level?: number;
  showEmptyPositions?: boolean;
  onEnrollPosition?: (parentCode: string, position: 'left' | 'right') => void;
}) {
  if (!nodes || nodes.length === 0) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
        {nodes.map((node) => {
          const isExpanded = expandedNodes.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          
          // Determine which positions are filled
          const leftChild = node.children?.find(c => c.placementPosition === 'left');
          const rightChild = node.children?.find(c => c.placementPosition === 'right');
          const hasEmptyLeft = !leftChild && showEmptyPositions;
          const hasEmptyRight = !rightChild && showEmptyPositions;
          const showChildrenArea = isExpanded && (hasChildren || hasEmptyLeft || hasEmptyRight);
          
          return (
            <div key={node.id} className="flex flex-col items-center">
              <TreeNodeCard
                node={node}
                expanded={isExpanded}
                onToggle={() => toggleNode(node.id)}
                onSelect={() => setSelectedNode(node)}
                isSelected={selectedNode?.id === node.id}
                level={level}
                showEmptyPositions={showEmptyPositions}
                onEnrollPosition={onEnrollPosition}
              />
              
              {/* Connection Line */}
              {showChildrenArea && (
                <div className="w-px h-8 bg-[#c8ff00]/30 mt-4" />
              )}
              
              {/* Children and Empty Positions */}
              {showChildrenArea && (
                <div className="mt-2 flex gap-4">
                  {/* Left Position */}
                  {leftChild ? (
                    <TreeLevel
                      nodes={[leftChild]}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                      level={level + 1}
                      showEmptyPositions={showEmptyPositions}
                      onEnrollPosition={onEnrollPosition}
                    />
                  ) : hasEmptyLeft ? (
                    <EmptyPositionCard
                      position="left"
                      parentCode={node.distributorCode}
                      onEnroll={() => onEnrollPosition?.(node.distributorCode, 'left')}
                    />
                  ) : null}
                  
                  {/* Right Position */}
                  {rightChild ? (
                    <TreeLevel
                      nodes={[rightChild]}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                      level={level + 1}
                      showEmptyPositions={showEmptyPositions}
                      onEnrollPosition={onEnrollPosition}
                    />
                  ) : hasEmptyRight ? (
                    <EmptyPositionCard
                      position="right"
                      parentCode={node.distributorCode}
                      onEnroll={() => onEnrollPosition?.(node.distributorCode, 'right')}
                    />
                  ) : null}
                  
                  {/* Non-binary children (if any without position) */}
                  {node.children?.filter(c => !c.placementPosition && c.id !== leftChild?.id && c.id !== rightChild?.id).map(child => (
                    <TreeLevel
                      key={child.id}
                      nodes={[child]}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                      level={level + 1}
                      showEmptyPositions={showEmptyPositions}
                      onEnrollPosition={onEnrollPosition}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Interactive Tree Container with Pan/Zoom
function InteractiveTreeContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8); // Start at 80% for better mobile view
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Detect mobile and set initial scale
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setScale(0.6); // Smaller scale for mobile
      } else {
        setScale(0.8);
      }
    };
    checkMobile();
    setIsLoaded(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.25), 2));
  }, []);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
  }, [position]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition({
      x: startPosition.x + dx,
      y: startPosition.y + dy
    });
  }, [isDragging, dragStart, startPosition]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default to avoid scroll conflicts
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setStartPosition(position);
    } else if (e.touches.length === 2) {
      // Pinch zoom start - calculate initial distance
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      (containerRef.current as any)._initialPinchDist = dist;
      (containerRef.current as any)._initialScale = scale;
    }
  }, [position, scale]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setPosition({
        x: startPosition.x + dx,
        y: startPosition.y + dy
      });
    } else if (e.touches.length === 2 && containerRef.current) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const initialDist = (containerRef.current as any)._initialPinchDist || dist;
      const initialScale = (containerRef.current as any)._initialScale || scale;
      const newScale = Math.min(Math.max(initialScale * (dist / initialDist), 0.25), 2);
      setScale(newScale);
    }
  }, [isDragging, dragStart, startPosition, scale]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 2));
  }, []);
  
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev * 0.8, 0.25));
  }, []);
  
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);
  
  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-1 border border-[#c8ff00]/30">
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-[#c8ff00]/20 rounded transition-colors text-[#c8ff00]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-[#c8ff00]/20 rounded transition-colors text-[#c8ff00]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 hover:bg-[#c8ff00]/20 rounded transition-colors text-[#c8ff00]"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="text-[10px] text-center text-gray-400 px-1">
          {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Pan/Zoom Instructions */}
      <div className="absolute bottom-2 left-2 z-10 text-[10px] text-gray-500 bg-black/60 px-2 py-1 rounded">
        {isMobile ? 'Drag to pan • Pinch to zoom' : 'Drag to pan • Scroll to zoom'}
      </div>
      
      {/* Loading state for mobile */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#c8ff00] text-sm">Loading tree...</span>
          </div>
        </div>
      )}
      
      {/* Interactive Container */}
      <div
        ref={containerRef}
        className={`overflow-hidden min-h-[250px] sm:min-h-[400px] md:min-h-[500px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'none' }} // Critical for iOS touch handling
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className="transition-transform duration-75 origin-center p-8"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            minWidth: 'max-content'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GenealogyTree({ rootDistributor, team, useApi = true, showTutorial = false }: GenealogyTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [isTutorialMode, setIsTutorialMode] = useState(showTutorial);
  const [showEmptyPositions, setShowEmptyPositions] = useState(true);
  const [enrollmentModal, setEnrollmentModal] = useState<{ parentCode: string; position: 'left' | 'right' } | null>(null);
  
  // Fetch genealogy data from API
  const { data: genealogyData, isLoading } = trpc.distributor.genealogy.useQuery(
    { depth: 5 },
    { enabled: useApi && !isTutorialMode }
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
  
  // Build tree from props if not using API, or use sample data in tutorial mode
  const treeData = isTutorialMode ? SAMPLE_TREE_DATA : (useApi ? genealogyData : (() => {
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
  })());

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
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant={showEmptyPositions ? "default" : "outline"} 
                onClick={() => setShowEmptyPositions(!showEmptyPositions)} 
                className={showEmptyPositions ? "bg-green-500 hover:bg-green-600 text-white" : "border-green-500/50 text-green-400 hover:bg-green-500/10"}
              >
                {showEmptyPositions ? "Hide Empty Spots" : "Show Empty Spots"}
              </Button>
              <Button 
                size="sm" 
                variant={isTutorialMode ? "default" : "outline"} 
                onClick={() => setIsTutorialMode(!isTutorialMode)} 
                className={isTutorialMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "border-blue-500/50 text-blue-400 hover:bg-blue-500/10"}
              >
                {isTutorialMode ? "Exit Tutorial" : "View Tutorial"}
              </Button>
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
          {/* Tutorial Mode Banner */}
          {isTutorialMode && (
            <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <h4 className="font-bold text-blue-400 mb-1">Tutorial Mode - Sample Network</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    This is a sample genealogy tree showing how your network could look. In this example:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-white">You</strong> are at Gold rank with $15,000 in team sales</li>
                    <li><strong className="text-white">Sarah (Left Leg)</strong> - Silver rank with 2 team members</li>
                    <li><strong className="text-white">John (Right Leg)</strong> - Gold rank with 2 team members</li>
                    <li>Click on any node to see detailed stats and commission potential</li>
                    <li>Binary commissions are calculated from the weaker leg volume</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Tree Visualization with Pan/Zoom */}
          <div className="relative bg-black/50 rounded-lg border border-[#c8ff00]/20">
            {treeData?.distributor ? (
              <InteractiveTreeContainer>
                {treeData.tree && treeData.tree.length > 0 ? (
                  <TreeLevel
                    nodes={treeData.tree}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    showEmptyPositions={showEmptyPositions}
                    onEnrollPosition={(parentCode, position) => setEnrollmentModal({ parentCode, position })}
                  />
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <TreeNodeCard
                      node={{
                        id: treeData.distributor.id,
                        distributorCode: treeData.distributor.distributorCode,
                        username: treeData.distributor.username,
                        name: treeData.distributor.username,
                        email: null,
                        rank: treeData.distributor.rank,
                        personalSales: treeData.distributor.personalSales,
                        teamSales: treeData.distributor.teamSales,
                        leftLegVolume: treeData.distributor.leftLegVolume,
                        rightLegVolume: treeData.distributor.rightLegVolume,
                        monthlyPV: treeData.distributor.monthlyPV,
                        isActive: treeData.distributor.isActive,
                        placementPosition: null,
                        depth: 0,
                        children: [],
                        childCount: 0
                      }}
                      expanded={true}
                      onToggle={() => {}}
                      onSelect={() => setSelectedNode({
                        id: treeData.distributor.id,
                        distributorCode: treeData.distributor.distributorCode,
                        username: treeData.distributor.username,
                        name: treeData.distributor.username,
                        email: null,
                        rank: treeData.distributor.rank,
                        personalSales: treeData.distributor.personalSales,
                        teamSales: treeData.distributor.teamSales,
                        leftLegVolume: treeData.distributor.leftLegVolume,
                        rightLegVolume: treeData.distributor.rightLegVolume,
                        monthlyPV: treeData.distributor.monthlyPV,
                        isActive: treeData.distributor.isActive,
                        placementPosition: null,
                        depth: 0,
                        children: [],
                        childCount: 0
                      })}
                      isSelected={false}
                      level={0}
                      showEmptyPositions={showEmptyPositions}
                      onEnrollPosition={(parentCode, position) => setEnrollmentModal({ parentCode, position })}
                    />
                    {showEmptyPositions && (
                      <div className="flex gap-8 mt-8">
                        <EmptyPositionCard
                          position="left"
                          parentCode={treeData.distributor.distributorCode}
                          onEnroll={() => setEnrollmentModal({ parentCode: treeData.distributor.distributorCode, position: 'left' })}
                        />
                        <EmptyPositionCard
                          position="right"
                          parentCode={treeData.distributor.distributorCode}
                          onEnroll={() => setEnrollmentModal({ parentCode: treeData.distributor.distributorCode, position: 'right' })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </InteractiveTreeContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Users className="w-16 h-16 mb-4 opacity-30" />
                <p>No distributor data available</p>
                <p className="text-sm">Please log in as a distributor to view your genealogy tree</p>
              </div>
            )}
            
            {/* Legend with Rank Icons */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg p-3 space-y-1">
              <div className="text-xs font-bold text-[#c8ff00] mb-2">RANK BADGES</div>
              {Object.entries(RANK_CONFIG).slice(0, 6).map(([rank, config]) => (
                <div key={rank} className="flex items-center gap-2 text-xs">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-gray-300" style={{ color: config.color }}>{config.name}</span>
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
              <span className="flex items-center gap-2">
                <RankIcon rank={selectedNode.rank} size="md" showTooltip={false} />
                Distributor Details
              </span>
              <RankBadge rank={selectedNode.rank} size="lg" showTooltip={true} />
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
      
      {/* Enrollment Modal */}
      {enrollmentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-[#0a0a0a] border-[#c8ff00] max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#c8ff00]">
                <Users className="w-5 h-5" />
                Enroll New Distributor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-[#c8ff00]/10 rounded-lg border border-[#c8ff00]/30">
                <div className="text-sm text-gray-400 mb-1">Placement Position</div>
                <div className="text-xl font-bold text-white">
                  {enrollmentModal.position.toUpperCase()} leg under {enrollmentModal.parentCode}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm">
                Share your enrollment link with a new prospect to place them in this position:
              </p>
              
              <div className="p-3 bg-black rounded-lg border border-[#c8ff00]/30 font-mono text-xs text-[#c8ff00] break-all">
                {window.location.origin}/join?sponsor={enrollmentModal.parentCode}&position={enrollmentModal.position}
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join?sponsor=${enrollmentModal.parentCode}&position=${enrollmentModal.position}`
                    );
                  }}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                  onClick={() => setEnrollmentModal(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
