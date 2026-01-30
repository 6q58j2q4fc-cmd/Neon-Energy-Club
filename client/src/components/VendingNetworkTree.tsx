import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, ChevronRight, MapPin, DollarSign, 
  Activity, Users, Zap, TrendingUp, Package
} from "lucide-react";

interface VendingMachine {
  id: number;
  machineId: string;
  location: string;
  status: "active" | "inactive" | "maintenance";
  monthlyRevenue: number;
  totalSales: number;
  referredBy?: string;
  referrals: VendingMachine[];
  commissionVolume: number;
  level: number;
}

interface VendingNetworkTreeProps {
  machines: VendingMachine[];
  totalNetworkCV: number;
  totalNetworkRevenue: number;
  directReferralCommission: number;
  networkCommission: number;
}

function MachineNode({ machine, depth = 0 }: { machine: VendingMachine; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = machine.referrals && machine.referrals.length > 0;

  const statusColors = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    maintenance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="relative">
      {/* Connection line */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 w-6 h-full">
          <div className="absolute left-3 top-0 w-px h-6 bg-[#c8ff00]/30" />
          <div className="absolute left-3 top-6 w-3 h-px bg-[#c8ff00]/30" />
        </div>
      )}

      <div className={`${depth > 0 ? "ml-6" : ""}`}>
        <div 
          className={`
            p-4 rounded-lg border transition-all cursor-pointer
            ${depth === 0 
              ? "bg-gradient-to-r from-[#c8ff00]/20 to-transparent border-[#c8ff00]" 
              : "bg-black/50 border-[#c8ff00]/20 hover:border-[#c8ff00]/50"
            }
          `}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <button className="text-[#c8ff00]">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {!hasChildren && <div className="w-4" />}
              
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#c8ff00]" />
              </div>
              
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  {machine.machineId}
                  <Badge className={statusColors[machine.status]}>
                    {machine.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {machine.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <div className="text-xs text-gray-500">Monthly Revenue</div>
                <div className="font-bold text-[#c8ff00]">
                  ${(machine.monthlyRevenue / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">CV</div>
                <div className="font-bold text-[#00e5ff]">
                  {machine.commissionVolume}
                </div>
              </div>
              {hasChildren && (
                <div>
                  <div className="text-xs text-gray-500">Network</div>
                  <div className="font-bold text-[#ff0080]">
                    {machine.referrals.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {machine.referrals.map((child) => (
              <MachineNode key={child.id} machine={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendingNetworkTree({
  machines,
  totalNetworkCV,
  totalNetworkRevenue,
  directReferralCommission,
  networkCommission,
}: VendingNetworkTreeProps) {
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-black border-[#c8ff00]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#c8ff00]" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Machines</div>
                <div className="text-2xl font-black text-white">{machines.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#00e5ff]/20 to-black border-[#00e5ff]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00e5ff]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Network CV</div>
                <div className="text-2xl font-black text-white">{totalNetworkCV}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ff0080]/20 to-black border-[#ff0080]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff0080]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#ff0080]" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Network Revenue</div>
                <div className="text-2xl font-black text-white">
                  ${(totalNetworkRevenue / 100).toFixed(0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-black border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Commission</div>
                <div className="text-2xl font-black text-white">
                  ${((directReferralCommission + networkCommission) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card className="bg-black/50 border-[#c8ff00]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#c8ff00]" />
            Vending Commission Breakdown
          </CardTitle>
          <CardDescription>Your earnings from the vending micro-franchise network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/30">
              <div className="text-sm text-gray-400 mb-1">Direct Referral Commission (10%)</div>
              <div className="text-2xl font-black text-[#c8ff00]">
                ${(directReferralCommission / 100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Earned from machines you directly referred
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/30">
              <div className="text-sm text-gray-400 mb-1">Network CV Commission (5%)</div>
              <div className="text-2xl font-black text-[#00e5ff]">
                ${(networkCommission / 100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Earned from your network's total commission volume
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Your Vending Network</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "tree" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("tree")}
            className={viewMode === "tree" ? "bg-[#c8ff00] text-black" : "border-[#c8ff00]/30 text-white"}
          >
            Tree View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#c8ff00] text-black" : "border-[#c8ff00]/30 text-white"}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Network Tree/List */}
      {machines.length === 0 ? (
        <Card className="bg-black/50 border-[#c8ff00]/20">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Vending Machines Yet</h3>
            <p className="text-gray-400 mb-4">
              Start building your vending network by referring new machine owners!
            </p>
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
              Learn About Vending Opportunities
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "tree" ? (
        <div className="space-y-4">
          {machines.map((machine) => (
            <MachineNode key={machine.id} machine={machine} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {machines.map((machine) => (
            <Card key={machine.id} className="bg-black/50 border-[#c8ff00]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#c8ff00]" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{machine.machineId}</div>
                      <div className="text-sm text-gray-400">{machine.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={
                      machine.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : machine.status === "maintenance"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }>
                      {machine.status}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-[#c8ff00]">
                        ${(machine.monthlyRevenue / 100).toFixed(2)}/mo
                      </div>
                      <div className="text-xs text-gray-500">CV: {machine.commissionVolume}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
