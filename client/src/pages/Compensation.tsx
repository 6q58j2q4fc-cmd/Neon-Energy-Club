import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Award,
  DollarSign,
  Star,
  Crown,
  Target,
  Gift,
  ArrowRight,
  Check,
  ChevronRight,
  Building2,
  Coins
} from "lucide-react";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";

// Rank definitions
const ranks = [
  { name: "Associate", icon: Star, color: "text-gray-400", requirement: "Join with any pack", bonus: "$0", teamReq: "None" },
  { name: "Manager", icon: Star, color: "text-green-500", requirement: "500 GV + 2 active legs", bonus: "$500", teamReq: "2 personally enrolled" },
  { name: "Director", icon: Award, color: "text-blue-500", requirement: "2,500 GV + 4 active legs", bonus: "$2,500", teamReq: "4 personally enrolled" },
  { name: "Executive", icon: Crown, color: "text-purple-500", requirement: "10,000 GV + 6 active legs", bonus: "$10,000", teamReq: "2 Directors in team" },
  { name: "Presidential", icon: Crown, color: "text-[#c8ff00]", requirement: "50,000 GV + 8 active legs", bonus: "$25,000", teamReq: "2 Executives in team" },
];

// Commission structure
const commissionLevels = [
  { level: 1, name: "Personal Sales", rate: "20-30%", description: "Direct retail profit on your personal sales" },
  { level: 2, name: "Level 2", rate: "10%", description: "Commissions from your personally enrolled team" },
  { level: 3, name: "Level 3", rate: "5%", description: "Commissions from your team's enrollments" },
  { level: 4, name: "Level 4", rate: "3%", description: "Building depth in your organization" },
  { level: 5, name: "Level 5", rate: "3%", description: "Maximum depth for unilevel commissions" },
];

// Binary bonuses
const binaryBonuses = [
  { rank: "Associate", weeklyMax: "$2,500", rate: "10%" },
  { rank: "Manager", weeklyMax: "$5,000", rate: "10%" },
  { rank: "Director", weeklyMax: "$7,500", rate: "10%" },
  { rank: "Executive", weeklyMax: "$10,000", rate: "10%" },
  { rank: "Presidential", weeklyMax: "Uncapped", rate: "10%" },
];

export default function Compensation() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen vice-bg text-white overflow-x-hidden">
      {/* Vice City Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/vice-city-bg-vibrant.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0418]/95 via-[#0d0418]/98 to-[#0d0418]" />
      </div>

      <HamburgerHeader variant="vice" />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(255,0,128,0.3),transparent_60%)]"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-[#ff0080]/20 text-[#ff0080] border-[#ff0080]/30 mb-6">
              <DollarSign className="w-4 h-4 mr-2" />
              COMPENSATION PLAN
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              BUILD YOUR
              <span className="block gradient-text-vice">EMPIRE</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Our hybrid compensation plan combines the best of binary and unilevel structures, 
              rewarding both team building and personal sales with industry-leading payouts.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-[#c8ff00]">40-45%</div>
                <div className="text-gray-400">Total Payout</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[#00ffff]">Weekly</div>
                <div className="text-gray-400">Commission Payouts</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[#ff0080]">5 Ways</div>
                <div className="text-gray-400">To Earn</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs italic mt-6">
              *Results may vary. Income examples are not guarantees of earnings. Your success depends on your effort, skill, and market conditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vending Machine Profit Sharing Pool Banner */}
      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-gradient-to-r from-[#c8ff00]/20 via-[#00ff00]/10 to-[#c8ff00]/20 border-2 border-[#c8ff00]/50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-2xl bg-[#c8ff00]/20 flex-shrink-0">
                  <Building2 className="w-12 h-12 text-[#c8ff00]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black text-white mb-2">
                    <span className="text-[#c8ff00]">VENDING MACHINE</span> PROFIT SHARING POOL
                  </h3>
                  <p className="text-gray-300 mb-4">
                    All <strong className="text-[#c8ff00]">active and qualified distributors</strong> participate in a profit sharing pool 
                    from <strong>all vending machine sales across the entire NEON network</strong>. This means you can earn from 
                    the collective success of NEON vending operations—even if you don't own a vending territory.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-black/30 rounded-lg px-4 py-2 border border-[#c8ff00]/30">
                      <div className="text-xs text-gray-400">Pool Contribution</div>
                      <div className="text-lg font-bold text-[#c8ff00]">5% of All Vending Sales</div>
                    </div>
                    <div className="bg-black/30 rounded-lg px-4 py-2 border border-[#00ffff]/30">
                      <div className="text-xs text-gray-400">Distribution</div>
                      <div className="text-lg font-bold text-[#00ffff]">Monthly Payouts</div>
                    </div>
                    <div className="bg-black/30 rounded-lg px-4 py-2 border border-[#ff0080]/30">
                      <div className="text-xs text-gray-400">Qualification</div>
                      <div className="text-lg font-bold text-[#ff0080]">Active Status Required</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6 Ways to Earn */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4">6 Ways to Earn</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Multiple income streams designed to reward every aspect of your business
          </p>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { num: 1, title: "Retail Profit", desc: "20-30% on personal sales", icon: DollarSign },
              { num: 2, title: "Fast Start", desc: "Bonuses on new enrollments", icon: Zap },
              { num: 3, title: "Team Commissions", desc: "5 levels deep unilevel", icon: Users },
              { num: 4, title: "Binary Bonus", desc: "10% on weaker leg volume", icon: TrendingUp },
              { num: 5, title: "Rank Bonuses", desc: "Up to $25,000 one-time", icon: Award },
              { num: 6, title: "Vending Pool", desc: "Share of all vending sales", icon: Coins, highlight: true },
            ].map((way, index) => (
              <motion.div
                key={way.num}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`${'highlight' in way && way.highlight ? 'bg-gradient-to-br from-[#c8ff00]/20 to-[#00ff00]/10 border-[#c8ff00] shadow-[0_0_20px_rgba(200,255,0,0.3)]' : 'glass-card-vice'} hover:border-[#c8ff00]/50 transition-all h-full text-center`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-full ${'highlight' in way && way.highlight ? 'bg-[#c8ff00]/30' : 'bg-[#c8ff00]/20'} flex items-center justify-center mx-auto mb-4`}>
                      <way.icon className="w-6 h-6 text-[#c8ff00]" />
                    </div>
                    <div className="text-[#ff0080] font-bold text-sm mb-2">WAY #{way.num}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{way.title}</h3>
                    <p className="text-gray-400 text-sm">{way.desc}</p>
                    {'highlight' in way && way.highlight && (
                      <Badge className="mt-3 bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30">
                        NEW
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Compensation Tabs */}
      <section className="py-20 px-4 bg-[#0a0a0a] relative z-10">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="unilevel" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 bg-black/50 border border-[#c8ff00]/30">
              <TabsTrigger 
                value="unilevel" 
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                Unilevel Plan
              </TabsTrigger>
              <TabsTrigger 
                value="binary"
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                Binary Bonus
              </TabsTrigger>
              <TabsTrigger 
                value="ranks"
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                Rank Advancement
              </TabsTrigger>
            </TabsList>

            {/* Unilevel Tab */}
            <TabsContent value="unilevel">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-6 text-white">Unilevel Commissions</h3>
                  <p className="text-gray-300 mb-8">
                    Earn commissions on the sales volume of your entire team, up to 5 levels deep. 
                    The more you help your team succeed, the more you earn.
                  </p>
                  
                  <div className="space-y-4">
                    {commissionLevels.map((level, index) => (
                      <motion.div
                        key={level.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-4 bg-black/50 border border-[#c8ff00]/20 rounded-lg p-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#c8ff00]/20 flex items-center justify-center font-bold text-[#c8ff00]">
                          L{level.level}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{level.name}</div>
                          <div className="text-gray-300 text-sm">{level.description}</div>
                        </div>
                        <div className="text-2xl font-black text-[#c8ff00]">{level.rate}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30 rounded-2xl p-8">
                  <h4 className="text-xl font-bold mb-6 text-center text-white">Example Earnings</h4>
                  <div className="space-y-4 bg-black/80 rounded-xl p-6">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                      <span className="text-gray-300">Your Personal Sales</span>
                      <span className="font-bold text-white">$1,000 × 25% = <span className="text-[#c8ff00]">$250</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                      <span className="text-gray-300">Level 1 Team (5 people)</span>
                      <span className="font-bold text-white">$5,000 × 10% = <span className="text-[#c8ff00]">$500</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                      <span className="text-gray-300">Level 2 Team (25 people)</span>
                      <span className="font-bold text-white">$25,000 × 5% = <span className="text-[#c8ff00]">$1,250</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                      <span className="text-gray-300">Levels 3-5 Combined</span>
                      <span className="font-bold text-white">$100,000 × 3% = <span className="text-[#c8ff00]">$3,000</span></span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-bold text-white">Weekly Total</span>
                      <span className="text-3xl font-black text-[#c8ff00]">$5,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Binary Tab */}
            <TabsContent value="binary">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30 rounded-2xl p-8">
                  <h4 className="text-xl font-bold mb-6 text-center">Binary Structure</h4>
                  <div className="relative">
                    {/* Visual tree representation */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#c8ff00] flex items-center justify-center text-black font-bold mb-4">
                        YOU
                      </div>
                      <div className="w-px h-8 bg-[#c8ff00]"></div>
                      <div className="flex gap-24">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-8 bg-[#c8ff00]"></div>
                          <div className="w-12 h-12 rounded-full bg-green-500/30 border-2 border-green-500 flex items-center justify-center text-sm font-bold">
                            L
                          </div>
                          <div className="text-green-500 text-sm mt-2">Left Leg</div>
                          <div className="text-gray-400 text-xs">$50,000 GV</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-px h-8 bg-[#c8ff00]"></div>
                          <div className="w-12 h-12 rounded-full bg-blue-500/30 border-2 border-blue-500 flex items-center justify-center text-sm font-bold">
                            R
                          </div>
                          <div className="text-blue-500 text-sm mt-2">Right Leg</div>
                          <div className="text-gray-400 text-xs">$30,000 GV</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <div className="text-gray-400 mb-2">Commission on weaker leg:</div>
                      <div className="text-3xl font-black text-[#c8ff00]">$30,000 × 10% = $3,000</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold mb-6">Binary Team Bonus</h3>
                  <p className="text-gray-400 mb-8">
                    Build two teams (legs) and earn 10% commission on the sales volume of your weaker leg. 
                    This encourages balanced team building and creates powerful spillover benefits.
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#c8ff00]">Weekly Caps by Rank</h4>
                    {binaryBonuses.map((bonus, index) => (
                      <div 
                        key={bonus.rank}
                        className="flex items-center justify-between bg-black/50 border border-[#c8ff00]/20 rounded-lg p-4"
                      >
                        <span className="font-medium">{bonus.rank}</span>
                        <span className="text-[#c8ff00] font-bold">{bonus.weeklyMax}/week</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ranks Tab */}
            <TabsContent value="ranks">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4">Rank Advancement</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Climb the ranks and unlock bigger bonuses, higher commission caps, and exclusive leadership perks.
                </p>
              </div>

              <div className="grid gap-6">
                {ranks.map((rank, index) => (
                  <motion.div
                    key={rank.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-[#0a0a0a] border-[#c8ff00]/20 hover:border-[#c8ff00]/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex items-center gap-4 md:w-48">
                            <div className={`w-12 h-12 rounded-full bg-black flex items-center justify-center ${rank.color}`}>
                              <rank.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className={`font-bold text-lg ${rank.color}`}>{rank.name}</div>
                              <div className="text-gray-500 text-sm">Rank {index + 1}</div>
                            </div>
                          </div>
                          
                          <div className="flex-1 grid md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-gray-500 text-xs uppercase mb-1">Requirements</div>
                              <div className="text-white text-sm">{rank.requirement}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase mb-1">Team Requirement</div>
                              <div className="text-white text-sm">{rank.teamReq}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase mb-1">Rank Bonus</div>
                              <div className="text-[#c8ff00] font-bold text-lg">{rank.bonus}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Matching Bonus Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-[#c8ff00]/10 via-[#c8ff00]/5 to-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <Badge className="bg-[#c8ff00] text-black font-bold mb-4">LEADERSHIP BONUS</Badge>
              <h3 className="text-3xl font-bold mb-4">Matching Bonus</h3>
              <p className="text-gray-400">
                Earn a percentage of your personally enrolled leaders' binary commissions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-black/50 rounded-xl p-6">
                <div className="text-4xl font-black text-[#c8ff00] mb-2">10%</div>
                <div className="text-white font-medium">Level 1 Leaders</div>
                <div className="text-gray-500 text-sm">Personally enrolled</div>
              </div>
              <div className="bg-black/50 rounded-xl p-6">
                <div className="text-4xl font-black text-[#c8ff00] mb-2">5%</div>
                <div className="text-white font-medium">Level 2 Leaders</div>
                <div className="text-gray-500 text-sm">Your team's enrollments</div>
              </div>
              <div className="bg-black/50 rounded-xl p-6">
                <div className="text-4xl font-black text-[#c8ff00] mb-2">5%</div>
                <div className="text-white font-medium">Level 3 Leaders</div>
                <div className="text-gray-500 text-sm">Building depth</div>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-6">
              *Requires Executive rank or higher to qualify for matching bonuses
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start <span className="text-[#c8ff00]">Earning</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of NEON distributors building their financial freedom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/shop")}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold px-8 py-6 text-lg neon-pulse"
            >
              Choose Your Pack
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => setLocation("/join")}
              variant="outline"
              className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold px-8 py-6 text-lg"
            >
              Join Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
