import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";

interface TreeNode {
  id: number;
  distributorCode: string;
  rank: string;
  personalSales: number;
  teamSize: number;
  children: TreeNode[];
}

interface GenealogyTreeProps {
  rootDistributor: any;
  team: any[];
}

export default function GenealogyTree({ rootDistributor, team }: GenealogyTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  useEffect(() => {
    if (!rootDistributor) return;

    // Build tree structure
    const buildTree = (distributor: any, teamMembers: any[]): TreeNode => {
      const children = teamMembers
        .filter((member) => member.sponsorId === distributor.id)
        .map((child) => buildTree(child, teamMembers));

      return {
        id: distributor.id,
        distributorCode: distributor.distributorCode,
        rank: distributor.rank,
        personalSales: distributor.personalSales || 0,
        teamSize: children.length,
        children,
      };
    };

    const tree = buildTree(rootDistributor, team);
    setTreeData(tree);
  }, [rootDistributor, team]);

  useEffect(() => {
    if (!treeData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(200, 255, 0, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Tree layout parameters
    const nodeRadius = 30;
    const levelHeight = 120;
    const minNodeSpacing = 100;

    // Calculate node positions
    const calculatePositions = (
      node: TreeNode,
      level: number,
      leftBound: number,
      rightBound: number
    ): { node: TreeNode; x: number; y: number }[] => {
      const positions: { node: TreeNode; x: number; y: number }[] = [];
      const x = (leftBound + rightBound) / 2;
      const y = 80 + level * levelHeight;

      positions.push({ node, x, y });

      if (node.children.length > 0) {
        const childWidth = (rightBound - leftBound) / node.children.length;
        node.children.forEach((child, index) => {
          const childLeft = leftBound + index * childWidth;
          const childRight = childLeft + childWidth;
          positions.push(...calculatePositions(child, level + 1, childLeft, childRight));
        });
      }

      return positions;
    };

    const positions = calculatePositions(treeData, 0, 0, width);

    // Draw connections
    ctx.strokeStyle = "rgba(200, 255, 0, 0.3)";
    ctx.lineWidth = 2;
    positions.forEach(({ node, x, y }) => {
      node.children.forEach((child) => {
        const childPos = positions.find((p) => p.node.id === child.id);
        if (childPos) {
          ctx.beginPath();
          ctx.moveTo(x, y + nodeRadius);
          ctx.lineTo(childPos.x, childPos.y - nodeRadius);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    positions.forEach(({ node, x, y }) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      
      // Rank-based colors
      const rankColors: Record<string, string> = {
        starter: "rgba(200, 255, 0, 0.2)",
        bronze: "rgba(205, 127, 50, 0.3)",
        silver: "rgba(192, 192, 192, 0.3)",
        gold: "rgba(255, 215, 0, 0.3)",
        platinum: "rgba(229, 228, 226, 0.3)",
        diamond: "rgba(185, 242, 255, 0.3)",
      };
      
      ctx.fillStyle = rankColors[node.rank] || rankColors.starter;
      ctx.fill();
      
      ctx.strokeStyle = "#c8ff00";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.distributorCode.substring(0, 8), x, y - 5);
      
      ctx.font = "8px Inter";
      ctx.fillStyle = "#c8ff00";
      ctx.fillText(node.rank.toUpperCase(), x, y + 8);

      // Team size badge
      if (node.children.length > 0) {
        ctx.beginPath();
        ctx.arc(x + nodeRadius - 5, y - nodeRadius + 5, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#c8ff00";
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "bold 9px Inter";
        ctx.fillText(node.children.length.toString(), x + nodeRadius - 5, y - nodeRadius + 5);
      }
    });

    // Add click handler
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const clicked = positions.find(({ x, y }) => {
        const dx = clickX - x;
        const dy = clickY - y;
        return Math.sqrt(dx * dx + dy * dy) <= nodeRadius;
      });

      if (clicked) {
        setSelectedNode(clicked.node);
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [treeData]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c8ff00]" />
            Genealogy Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-[600px] rounded-lg border border-[#c8ff00]/20"
            />
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg p-4 space-y-2">
              <div className="text-xs font-bold text-[#c8ff00] mb-2">RANKS</div>
              {[
                { rank: "Starter", color: "rgba(200, 255, 0, 0.5)" },
                { rank: "Bronze", color: "rgba(205, 127, 50, 0.7)" },
                { rank: "Silver", color: "rgba(192, 192, 192, 0.7)" },
                { rank: "Gold", color: "rgba(255, 215, 0, 0.7)" },
                { rank: "Platinum", color: "rgba(229, 228, 226, 0.7)" },
                { rank: "Diamond", color: "rgba(185, 242, 255, 0.7)" },
              ].map((item) => (
                <div key={item.rank} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-4 rounded-full border border-[#c8ff00]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-300">{item.rank}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Click on any node to view details
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-[#0a0a0a] border-[#c8ff00]">
          <CardHeader>
            <CardTitle>Distributor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Distributor Code</div>
                <div className="text-xl font-bold text-[#c8ff00]">{selectedNode.distributorCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Rank</div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold uppercase">{selectedNode.rank}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Direct Team</div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold">{selectedNode.teamSize}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Personal Sales</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-xl font-bold">
                    ${((selectedNode.personalSales || 0) / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
