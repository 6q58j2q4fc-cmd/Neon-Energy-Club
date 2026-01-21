import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { 
  Gift, 
  Users, 
  Copy, 
  Check, 
  Trophy, 
  Star, 
  Package,
  Share2,
  ArrowRight,
  Zap,
  Target,
  Crown
} from "lucide-react";

export default function CustomerPortal() {
  const { user, isAuthenticated } = useAuth();
  // Using sonner toast directly
  const [copied, setCopied] = useState(false);

  // Fetch customer referral data
  const { data: referralData, isLoading: referralLoading } = trpc.customer.getReferralStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch customer rewards
  const { data: rewards, isLoading: rewardsLoading } = trpc.customer.getRewards.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Generate referral code mutation
  const generateCodeMutation = trpc.customer.generateReferralCode.useMutation({
    onSuccess: () => {
      toast.success("Referral Code Generated!", {
        description: "Your unique referral code is ready to share.",
      });
    },
  });

  const copyReferralLink = () => {
    if (referralData?.referralCode) {
      const link = `${window.location.origin}?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link Copied!", {
        description: "Share this link with friends to earn free NEON!",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
        <HamburgerHeader />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#c8ff00]" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4">Customer Portal</h1>
              <p className="text-white/60 mb-8">
                Sign in to access your referral dashboard, track rewards, and get free NEON!
              </p>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-8 py-6 text-lg"
              >
                Sign In to Continue
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const referralsNeeded = 3;
  const currentReferrals = referralData?.successfulReferrals || 0;
  const progress = Math.min((currentReferrals / referralsNeeded) * 100, 100);
  const freeCasesEarned = Math.floor(currentReferrals / referralsNeeded);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
      <HamburgerHeader />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-full text-[#c8ff00] text-sm font-semibold mb-4">
              CUSTOMER REWARDS
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Welcome, <span className="text-[#c8ff00]">{user?.name?.split(' ')[0] || 'Friend'}</span>!
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Refer friends to NEON and earn FREE cases! Every 3 successful referrals = 1 FREE case of NEON Energy.
            </p>
          </div>

          {/* 3 for Free Hero Card */}
          <Card className="bg-gradient-to-br from-[#0d2818] to-[#1a3a2a] border-[#c8ff00]/30 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-[#c8ff00]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">3 FOR FREE</h2>
                      <p className="text-[#c8ff00] text-sm font-semibold">Customer Referral Program</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-6">
                    Share NEON with 3 friends who make a purchase, and we'll send you a FREE 12-pack case! 
                    There's no limit - keep referring and keep earning!
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Progress to next free case</span>
                      <span className="text-[#c8ff00] font-bold">{currentReferrals % 3} / 3 referrals</span>
                    </div>
                    <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#c8ff00] to-[#00ff88] rounded-full transition-all duration-500"
                        style={{ width: `${(currentReferrals % 3) / 3 * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  {referralData?.referralCode ? (
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}?ref=${referralData.referralCode}`}
                        readOnly
                        className="bg-black/30 border-[#c8ff00]/30 text-white"
                      />
                      <Button
                        onClick={copyReferralLink}
                        className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-6"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => generateCodeMutation.mutate()}
                      disabled={generateCodeMutation.isPending}
                      className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-8"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Generate My Referral Link
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:w-80">
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-[#c8ff00]">{currentReferrals}</div>
                    <div className="text-white/60 text-sm">Total Referrals</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-[#00ff88]">{freeCasesEarned}</div>
                    <div className="text-white/60 text-sm">Free Cases Earned</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-[#00ffff]">{referralData?.pendingReferrals || 0}</div>
                    <div className="text-white/60 text-sm">Pending</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-[#ff0080]">${(freeCasesEarned * 42).toFixed(0)}</div>
                    <div className="text-white/60 text-sm">Value Earned</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
                  <Share2 className="w-8 h-8 text-[#c8ff00]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Share Your Link</h3>
                <p className="text-white/60 text-sm">
                  Copy your unique referral link and share it with friends, family, and social media.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-[#00ff88]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Friends Purchase</h3>
                <p className="text-white/60 text-sm">
                  When your friends click your link and make their first NEON purchase, you get credit!
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff0080]/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-[#ff0080]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Get FREE NEON</h3>
                <p className="text-white/60 text-sm">
                  After 3 successful referrals, we ship you a FREE 12-pack case of NEON Energy!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Rewards */}
            <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#c8ff00]" />
                  Your Rewards
                </CardTitle>
                <CardDescription className="text-white/60">
                  Rewards you've earned through referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div className="text-center py-8 text-white/40">Loading rewards...</div>
                ) : rewards && rewards.length > 0 ? (
                  <div className="space-y-4">
                    {rewards.map((reward: any) => (
                      <div 
                        key={reward.id}
                        className={`p-4 rounded-xl border ${
                          reward.status === 'available' 
                            ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30' 
                            : reward.status === 'redeemed'
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              reward.status === 'available' ? 'bg-[#c8ff00]/20' : 'bg-white/10'
                            }`}>
                              <Gift className={`w-5 h-5 ${
                                reward.status === 'available' ? 'text-[#c8ff00]' : 'text-white/40'
                              }`} />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{reward.description}</div>
                              <div className="text-sm text-white/60">Value: ${reward.value}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reward.status === 'available' 
                              ? 'bg-[#c8ff00] text-black' 
                              : reward.status === 'redeemed'
                              ? 'bg-green-500 text-white'
                              : 'bg-white/20 text-white/60'
                          }`}>
                            {reward.status.toUpperCase()}
                          </div>
                        </div>
                        {reward.status === 'available' && reward.redemptionCode && (
                          <div className="mt-3 p-2 bg-black/30 rounded-lg">
                            <div className="text-xs text-white/40 mb-1">Redemption Code:</div>
                            <div className="font-mono text-[#c8ff00] font-bold">{reward.redemptionCode}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No rewards yet. Start referring to earn!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00ffff]" />
                  Referral History
                </CardTitle>
                <CardDescription className="text-white/60">
                  Friends you've referred to NEON
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referralLoading ? (
                  <div className="text-center py-8 text-white/40">Loading referrals...</div>
                ) : referralData?.referrals && referralData.referrals.length > 0 ? (
                  <div className="space-y-3">
                    {referralData.referrals.map((referral: any, index: number) => (
                      <div 
                        key={referral.id || index}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            referral.purchaseCompleted ? 'bg-green-500/20' : 'bg-yellow-500/20'
                          }`}>
                            {referral.purchaseCompleted ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Star className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {referral.referredName || 'Friend'}
                            </div>
                            <div className="text-white/40 text-xs">
                              {new Date(referral.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold ${
                          referral.purchaseCompleted ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {referral.purchaseCompleted ? 'Purchased' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No referrals yet. Share your link to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Become a Distributor CTA */}
          <Card className="mt-12 bg-gradient-to-r from-[#0d2818] via-[#1a3a2a] to-[#0d2818] border-[#00ffff]/30 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#00ffff]/20 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-[#00ffff]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Want to Earn Even More?</h3>
                    <p className="text-white/60">
                      Become a NEON Distributor and earn commissions on every sale!
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/join'}
                  className="bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-bold px-8"
                >
                  Become a Distributor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
