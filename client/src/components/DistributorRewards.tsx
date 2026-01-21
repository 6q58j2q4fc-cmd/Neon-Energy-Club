import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Gift, 
  Zap, 
  Package, 
  Trophy, 
  Star, 
  TrendingUp,
  Calendar,
  Check,
  Clock,
  Award
} from "lucide-react";

interface DistributorRewardsProps {
  distributorId: number;
}

export default function DistributorRewards({ distributorId }: DistributorRewardsProps) {
  // Fetch reward points
  const { data: monthlyPoints, isLoading: pointsLoading } = trpc.distributor.getMonthlyRewardPoints.useQuery(
    { distributorId },
    { enabled: !!distributorId }
  );

  // Fetch reward history
  const { data: rewardHistory, isLoading: historyLoading } = trpc.distributor.getRewardPointsHistory.useQuery(
    { distributorId },
    { enabled: !!distributorId }
  );

  // Fetch free rewards earned
  const { data: freeRewards, isLoading: freeRewardsLoading } = trpc.distributor.getFreeRewards.useQuery(
    { distributorId },
    { enabled: !!distributorId }
  );

  const currentPoints = monthlyPoints?.total || 0;
  const pointsNeeded = 3;
  const progress = Math.min((currentPoints / pointsNeeded) * 100, 100);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* 3 for Free Hero Card */}
      <Card className="bg-gradient-to-br from-[#0d2818] to-[#1a3a2a] border-[#c8ff00]/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                  <Gift className="w-7 h-7 text-[#c8ff00]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">3 FOR FREE</h2>
                  <p className="text-[#c8ff00] text-sm font-semibold">Distributor Rewards Program</p>
                </div>
              </div>
              
              <p className="text-white/70 mb-6">
                Sell 3 autoship subscriptions each month and earn <span className="text-[#c8ff00] font-bold">NEON Reward Points</span>! 
                Every 3 points = 1 FREE 24-pack case shipped to you. Keep selling, keep earning!
              </p>

              {/* How to Earn */}
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#c8ff00]" />
                  How to Earn Points
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>1 Point: Each new customer autoship enrollment</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>1 Point: Each new distributor autoship enrollment</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>3 Points = 1 FREE 24-pack case ($72 value)</span>
                  </li>
                </ul>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">{currentMonth} Progress</span>
                  <span className="text-[#c8ff00] font-bold">{currentPoints} / {pointsNeeded} points</span>
                </div>
                <Progress value={progress} className="h-4 bg-black/30" />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-white/40">0 points</span>
                  <span className="text-[#c8ff00]/60">FREE CASE!</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:w-72">
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-[#c8ff00]">{currentPoints}</div>
                <div className="text-white/60 text-xs">Points This Month</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-[#00ff88]">{freeRewards?.length || 0}</div>
                <div className="text-white/60 text-xs">Free Cases Earned</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center col-span-2">
                <div className="text-2xl font-black text-[#00ffff]">
                  ${((freeRewards?.length || 0) * 72).toFixed(0)}
                </div>
                <div className="text-white/60 text-xs">Total Value Earned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#c8ff00]" />
              Points Activity
            </CardTitle>
            <CardDescription className="text-white/60">
              Your recent point earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-center py-8 text-white/40">Loading...</div>
            ) : rewardHistory && rewardHistory.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rewardHistory.map((item: any, index: number) => (
                  <div 
                    key={item.id || index}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                        <Star className="w-4 h-4 text-[#c8ff00]" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{item.description}</div>
                        <div className="text-white/40 text-xs">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-[#c8ff00] font-bold">+{item.points}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No points earned yet. Start selling autoships!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Free Rewards Earned */}
        <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00ff88]" />
              Free Cases Earned
            </CardTitle>
            <CardDescription className="text-white/60">
              Your 3-for-Free rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {freeRewardsLoading ? (
              <div className="text-center py-8 text-white/40">Loading...</div>
            ) : freeRewards && freeRewards.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {freeRewards.map((reward: any, index: number) => (
                  <div 
                    key={reward.id || index}
                    className={`p-4 rounded-xl border ${
                      reward.status === 'shipped' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : reward.status === 'pending'
                        ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          reward.status === 'shipped' ? 'bg-green-500/20' : 'bg-[#c8ff00]/20'
                        }`}>
                          <Package className={`w-5 h-5 ${
                            reward.status === 'shipped' ? 'text-green-400' : 'text-[#c8ff00]'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">FREE 24-Pack Case</div>
                          <div className="text-sm text-white/60">
                            Earned: {reward.earnedMonth}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        reward.status === 'shipped' 
                          ? 'bg-green-500 text-white' 
                          : reward.status === 'pending'
                          ? 'bg-[#c8ff00] text-black'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        {reward.status === 'shipped' ? 'SHIPPED' : 
                         reward.status === 'pending' ? 'PENDING' : 
                         reward.status.toUpperCase()}
                      </div>
                    </div>
                    {reward.shippedAt && (
                      <div className="mt-2 text-xs text-white/40">
                        Shipped: {new Date(reward.shippedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No free cases yet. Earn 3 points to get your first!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-[#0d2818] via-[#1a3a2a] to-[#0d2818] border-[#00ffff]/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00ffff]/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-[#00ffff]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Pro Tips to Maximize Rewards</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ffff]" />
                  Focus on autoship enrollments - they count toward your 3-for-Free!
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ffff]" />
                  Help customers set up autoship for consistent monthly deliveries
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ffff]" />
                  New distributor autoships count too - grow your team and earn rewards!
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ffff]" />
                  Points reset monthly - maximize each month for more free cases!
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
