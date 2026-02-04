import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Sun, 
  Wifi, 
  Camera, 
  Share2, 
  Bot, 
  MapPin, 
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface VendingMachine {
  id: string;
  name: string;
  location: string;
  status: "active" | "restocking" | "offline";
  dailySales: number;
  weeklyLeads: number;
  lastRestock: string;
  batteryLevel: number;
}

// Sample vending machine network data
const sampleMachines: VendingMachine[] = [
  { id: "VM001", name: "Downtown Plaza", location: "123 Main St", status: "active", dailySales: 47, weeklyLeads: 23, lastRestock: "2 days ago", batteryLevel: 85 },
  { id: "VM002", name: "Tech Hub", location: "456 Innovation Ave", status: "active", dailySales: 62, weeklyLeads: 31, lastRestock: "1 day ago", batteryLevel: 92 },
  { id: "VM003", name: "University Center", location: "789 Campus Dr", status: "restocking", dailySales: 38, weeklyLeads: 18, lastRestock: "Today", batteryLevel: 78 },
  { id: "VM004", name: "Airport Terminal B", location: "Airport Blvd", status: "active", dailySales: 89, weeklyLeads: 45, lastRestock: "3 days ago", batteryLevel: 67 },
];

export default function VendingMachineTree() {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"network" | "details">("network");

  const totalDailySales = sampleMachines.reduce((sum, m) => sum + m.dailySales, 0);
  const totalWeeklyLeads = sampleMachines.reduce((sum, m) => sum + m.weeklyLeads, 0);
  const activeMachines = sampleMachines.filter(m => m.status === "active").length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-black to-[#c8ff00]/10 border border-[#c8ff00]/30 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge className="bg-[#c8ff00] text-black mb-4">REVOLUTIONARY TECHNOLOGY</Badge>
            <h2 className="text-4xl font-black text-white mb-4">
              NEON <span className="text-[#c8ff00]">SMART VENDING</span>
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Your 24/7 sales robot that never sleeps. AI-powered vending machines that sell NEON Energy Drink, 
              capture leads, and build your business automatically in high-traffic locations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] font-bold"
                onClick={() => toast.info("Vending machine inquiry form coming soon!")}
              >
                <Zap className="w-4 h-4 mr-2" />
                Get Your Machine
              </Button>
              <Button 
                variant="outline" 
                className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10"
                onClick={() => setViewMode(viewMode === "network" ? "details" : "network")}
              >
                {viewMode === "network" ? "View Features" : "View Network"}
              </Button>
            </div>
          </div>
          
          {/* Vending Machine Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-[#c8ff00]/30 shadow-2xl shadow-[#c8ff00]/20">
              <img 
                src="/vending-smart.jpg" 
                alt="NEON Smart Vending Machine" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[#c8ff00] font-bold text-lg">NEON Smart Vending</p>
                <p className="text-white/80 text-sm">AI-Powered • Solar Ready • WiFi Connected</p>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-2 -right-2 bg-[#c8ff00] text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              24/7 SALES
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Sun, title: "Solar Powered", desc: "Self-sustaining energy" },
          { icon: Wifi, title: "WiFi Connected", desc: "Real-time monitoring" },
          { icon: Camera, title: "Selfie Cam", desc: "Viral social sharing" },
          { icon: Bot, title: "AI Assistant", desc: "Talks to customers" },
          { icon: Share2, title: "Viral Platform", desc: "Built-in sharing" },
          { icon: RefreshCw, title: "Auto-Restock", desc: "Smart inventory" },
          { icon: Shield, title: "Secure", desc: "Anti-theft design" },
          { icon: Smartphone, title: "App Control", desc: "Manage remotely" },
        ].map((feature, i) => (
          <Card key={i} className="bg-black/50 border-[#c8ff00]/20 hover:border-[#c8ff00]/50 transition-all hover:scale-105">
            <CardContent className="p-4 text-center">
              <feature.icon className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm">{feature.title}</h4>
              <p className="text-gray-500 text-xs">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-transparent border-[#c8ff00]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{sampleMachines.length}</p>
                <p className="text-gray-400 text-sm">Active Machines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-transparent border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{totalDailySales}</p>
                <p className="text-gray-400 text-sm">Daily Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{totalWeeklyLeads}</p>
                <p className="text-gray-400 text-sm">Weekly Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{activeMachines}/{sampleMachines.length}</p>
                <p className="text-gray-400 text-sm">Online Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vending Machine Network Visualization */}
      <Card className="bg-black/50 border-[#c8ff00]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5 text-[#c8ff00]" />
            Your Vending Machine Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Network Tree Visualization */}
          <div className="relative p-8 bg-gradient-to-b from-[#c8ff00]/5 to-transparent rounded-xl border border-[#c8ff00]/10 min-h-[400px]">
            {/* Central Hub */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c8ff00] to-[#c8ff00]/50 flex items-center justify-center shadow-lg shadow-[#c8ff00]/30 border-4 border-black">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-black mx-auto" />
                  <span className="text-black font-bold text-xs">HQ</span>
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {/* Lines from HQ to machines */}
              <line x1="50%" y1="100" x2="15%" y2="200" stroke="#c8ff00" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              <line x1="50%" y1="100" x2="38%" y2="200" stroke="#c8ff00" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              <line x1="50%" y1="100" x2="62%" y2="200" stroke="#c8ff00" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              <line x1="50%" y1="100" x2="85%" y2="200" stroke="#c8ff00" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            </svg>

            {/* Machine Nodes */}
            <div className="absolute top-48 left-0 right-0 flex justify-around px-4" style={{ zIndex: 1 }}>
              {sampleMachines.map((machine, index) => (
                <div 
                  key={machine.id}
                  onClick={() => setSelectedMachine(selectedMachine === machine.id ? null : machine.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedMachine === machine.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border-2 ${
                    machine.status === 'active' 
                      ? 'bg-green-500/20 border-green-500 shadow-green-500/30' 
                      : machine.status === 'restocking'
                      ? 'bg-yellow-500/20 border-yellow-500 shadow-yellow-500/30'
                      : 'bg-red-500/20 border-red-500 shadow-red-500/30'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      machine.status === 'active' ? 'text-green-400' : 
                      machine.status === 'restocking' ? 'text-yellow-400' : 'text-red-400'
                    }`} />
                  </div>
                  <p className="text-center text-xs text-white mt-2 font-medium">{machine.name}</p>
                  <p className="text-center text-[10px] text-gray-500">${machine.dailySales}/day</p>
                </div>
              ))}
            </div>

            {/* Selected Machine Details */}
            {selectedMachine && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-[#c8ff00]/30">
                {(() => {
                  const machine = sampleMachines.find(m => m.id === selectedMachine);
                  if (!machine) return null;
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs">Location</p>
                        <p className="text-white font-medium">{machine.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Daily Sales</p>
                        <p className="text-[#c8ff00] font-bold">${machine.dailySales}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Weekly Leads</p>
                        <p className="text-blue-400 font-bold">{machine.weeklyLeads}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Battery</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                machine.batteryLevel > 50 ? 'bg-green-500' : 
                                machine.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${machine.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-white text-xs">{machine.batteryLevel}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="bg-gradient-to-r from-[#c8ff00]/10 via-purple-500/10 to-[#c8ff00]/10 border-[#c8ff00]/30">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-white mb-2">
              Why NEON <span className="text-[#c8ff00]">Smart Vending?</span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The biggest problem in network marketing? People don't sell consistently. 
              Our AI-powered vending machines solve this by selling 24/7/365 in high-traffic areas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-black/30 rounded-xl border border-white/10">
              <Clock className="w-12 h-12 text-[#c8ff00] mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">24/7 Sales Robot</h4>
              <p className="text-gray-400 text-sm">
                Never miss a sale. Your machine works while you sleep, vacation, or focus on team building.
              </p>
            </div>
            <div className="text-center p-6 bg-black/30 rounded-xl border border-white/10">
              <Star className="w-12 h-12 text-[#c8ff00] mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Lead Generation</h4>
              <p className="text-gray-400 text-sm">
                Built-in selfie cam and viral sharing platform turns every customer into a potential recruit.
              </p>
            </div>
            <div className="text-center p-6 bg-black/30 rounded-xl border border-white/10">
              <Shield className="w-12 h-12 text-[#c8ff00] mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Proprietary Tech</h4>
              <p className="text-gray-400 text-sm">
                Exclusive to NEON distributors. Our machines can't be replicated by competitors.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              size="lg"
              className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] font-bold text-lg px-8"
              onClick={() => toast.info("Contact your upline or visit the Vending page for more information!")}
            >
              Cement Your NEON Business <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
