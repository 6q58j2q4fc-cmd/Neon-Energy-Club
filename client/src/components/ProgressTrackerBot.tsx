import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Zap,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Star,
  Crown,
  ChevronRight,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  Bell,
  X,
  MessageCircle,
  Lightbulb,
  Gift,
  Calendar,
  Clock
} from "lucide-react";

// Rank definitions matching compensation plan
const RANKS = [
  { name: "Starter", pvRequired: 0, tvRequired: 0, lesserLegRequired: 0, bonus: 0, icon: Star, color: "#9ca3af" },
  { name: "Bronze", pvRequired: 100, tvRequired: 500, lesserLegRequired: 200, bonus: 100, icon: Star, color: "#d97706" },
  { name: "Silver", pvRequired: 100, tvRequired: 2000, lesserLegRequired: 800, bonus: 250, icon: Star, color: "#d1d5db" },
  { name: "Gold", pvRequired: 100, tvRequired: 5000, lesserLegRequired: 2000, bonus: 500, icon: Award, color: "#eab308" },
  { name: "Platinum", pvRequired: 100, tvRequired: 15000, lesserLegRequired: 6000, bonus: 1000, icon: Award, color: "#cbd5e1" },
  { name: "Diamond", pvRequired: 100, tvRequired: 50000, lesserLegRequired: 20000, bonus: 5000, icon: Crown, color: "#22d3ee" },
  { name: "Crown Diamond", pvRequired: 100, tvRequired: 150000, lesserLegRequired: 60000, bonus: 25000, icon: Crown, color: "#a855f7" },
  { name: "Royal Diamond", pvRequired: 100, tvRequired: 500000, lesserLegRequired: 200000, bonus: 100000, icon: Crown, color: "#c8ff00" },
];

interface DistributorStats {
  personalVolume: number;
  teamVolume: number;
  leftLegVolume: number;
  rightLegVolume: number;
  currentRank: string;
  directRecruits: number;
  totalTeamSize: number;
  weeklyCommission: number;
  monthlyCommission: number;
  fastStartEligible: boolean;
  fastStartDaysLeft: number;
}

interface ProgressTrackerBotProps {
  stats?: DistributorStats;
  distributorName?: string;
}

interface ActionItem {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  icon: React.ElementType;
  actionLabel: string;
  actionLink?: string;
}

export default function ProgressTrackerBot({ stats, distributorName = "Distributor" }: ProgressTrackerBotProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBot, setShowBot] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissedActions, setDismissedActions] = useState<string[]>([]);

  // Default stats if not provided
  const currentStats: DistributorStats = stats || {
    personalVolume: 0,
    teamVolume: 0,
    leftLegVolume: 0,
    rightLegVolume: 0,
    currentRank: "Starter",
    directRecruits: 0,
    totalTeamSize: 0,
    weeklyCommission: 0,
    monthlyCommission: 0,
    fastStartEligible: true,
    fastStartDaysLeft: 30,
  };

  // Find current and next rank
  const currentRankIndex = RANKS.findIndex(r => r.name === currentStats.currentRank);
  const currentRank = RANKS[currentRankIndex] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1];

  // Calculate progress to next rank
  const lesserLegVolume = Math.min(currentStats.leftLegVolume, currentStats.rightLegVolume);
  
  const pvProgress = nextRank ? Math.min(100, (currentStats.personalVolume / nextRank.pvRequired) * 100) : 100;
  const tvProgress = nextRank ? Math.min(100, (currentStats.teamVolume / nextRank.tvRequired) * 100) : 100;
  const legProgress = nextRank ? Math.min(100, (lesserLegVolume / nextRank.lesserLegRequired) * 100) : 100;

  // Generate personalized action items
  const generateActionItems = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Fast Start Bonus urgency
    if (currentStats.fastStartEligible && currentStats.fastStartDaysLeft <= 30) {
      actions.push({
        id: "fast-start",
        priority: currentStats.fastStartDaysLeft <= 7 ? "high" : "medium",
        title: `Fast Start Bonus - ${currentStats.fastStartDaysLeft} Days Left!`,
        description: `Enroll 3 distributors in your first 30 days to earn a $500 Fast Start Bonus. You have ${currentStats.fastStartDaysLeft} days remaining.`,
        impact: "+$500 bonus",
        icon: Clock,
        actionLabel: "Share Opportunity",
        actionLink: "/portal?tab=marketing"
      });
    }

    // PV requirement
    if (nextRank && currentStats.personalVolume < nextRank.pvRequired) {
      const pvNeeded = nextRank.pvRequired - currentStats.personalVolume;
      actions.push({
        id: "pv-requirement",
        priority: pvNeeded > 50 ? "high" : "medium",
        title: `Increase Personal Volume by ${pvNeeded} PV`,
        description: `You need ${pvNeeded} more PV to qualify for ${nextRank.name}. Place a personal order or set up auto-ship.`,
        impact: `Qualify for ${nextRank.name}`,
        icon: DollarSign,
        actionLabel: "Shop Now",
        actionLink: "/shop"
      });
    }

    // Team building
    if (currentStats.directRecruits < 2) {
      actions.push({
        id: "first-recruits",
        priority: "high",
        title: "Enroll Your First Team Members",
        description: "Building a team is key to maximizing your earnings. Start with friends, family, or social media contacts who love energy drinks.",
        impact: "Unlock team commissions",
        icon: Users,
        actionLabel: "Get Marketing Tools",
        actionLink: "/portal?tab=marketing"
      });
    }

    // Binary leg balance
    const legDifference = Math.abs(currentStats.leftLegVolume - currentStats.rightLegVolume);
    const weakerLeg = currentStats.leftLegVolume < currentStats.rightLegVolume ? "left" : "right";
    if (legDifference > 500 && currentStats.totalTeamSize > 0) {
      actions.push({
        id: "balance-legs",
        priority: "medium",
        title: `Balance Your ${weakerLeg.charAt(0).toUpperCase() + weakerLeg.slice(1)} Leg`,
        description: `Your ${weakerLeg} leg is ${legDifference} PV behind. Focus recruiting efforts there to maximize binary bonus.`,
        impact: "+10% binary bonus",
        icon: TrendingUp,
        actionLabel: "View Team Tree",
        actionLink: "/portal?tab=my-team"
      });
    }

    // Lesser leg volume for rank advancement
    if (nextRank && lesserLegVolume < nextRank.lesserLegRequired) {
      const legNeeded = nextRank.lesserLegRequired - lesserLegVolume;
      actions.push({
        id: "lesser-leg",
        priority: "medium",
        title: `Build Lesser Leg Volume (+${legNeeded} needed)`,
        description: `Your weaker leg needs ${legNeeded} more volume for ${nextRank.name}. Help your team members succeed!`,
        impact: `$${nextRank.bonus.toLocaleString()} rank bonus`,
        icon: Target,
        actionLabel: "Team Training",
        actionLink: "/portal?tab=training"
      });
    }

    // Auto-ship recommendation
    if (currentStats.personalVolume === 0) {
      actions.push({
        id: "autoship",
        priority: "medium",
        title: "Set Up Auto-Ship for Consistent PV",
        description: "Never miss your monthly PV requirement. Auto-ship ensures you stay qualified and saves you money.",
        impact: "Stay rank qualified",
        icon: Calendar,
        actionLabel: "Set Up Auto-Ship",
        actionLink: "/portal?tab=autoship"
      });
    }

    // Rank advancement celebration
    if (nextRank && tvProgress >= 90 && pvProgress >= 100 && legProgress >= 90) {
      actions.push({
        id: "almost-there",
        priority: "high",
        title: `You're Almost ${nextRank.name}! 🎉`,
        description: `Just a little more push and you'll hit ${nextRank.name} rank with a $${nextRank.bonus.toLocaleString()} bonus!`,
        impact: `$${nextRank.bonus.toLocaleString()} one-time bonus`,
        icon: Gift,
        actionLabel: "Final Push Tips",
        actionLink: "/portal?tab=training"
      });
    }

    return actions.filter(a => !dismissedActions.includes(a.id));
  };

  const actionItems = generateActionItems();

  // Rotating tips
  const tips = [
    "💡 Tip: Share your replicated website link on social media to attract new customers and team members!",
    "🎯 Focus on building both legs equally - your binary bonus is based on your weaker leg's volume.",
    "⚡ Fast Start Bonus: Enroll 3 distributors in 30 days to earn an extra $500!",
    "📱 Use the QR code on your marketing materials for easy sign-ups.",
    "🏆 Help your team succeed - when they rank up, you earn more commissions!",
    "💰 Set up auto-ship to never miss your monthly PV qualification.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const dismissAction = (id: string) => {
    setDismissedActions([...dismissedActions, id]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!showBot) {
    return (
      <Button
        onClick={() => setShowBot(true)}
        className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-[#c8ff00] to-[#00ff00] text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0a1a0a] to-[#0d2818] border border-[#c8ff00]/30 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c8ff00]/20 to-[#00ff00]/10 p-4 border-b border-[#c8ff00]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c8ff00] to-[#00ff00] flex items-center justify-center">
                <Bot className="w-7 h-7 text-black" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a1a0a] animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                NEON Progress Bot
                <Sparkles className="w-4 h-4 text-[#c8ff00]" />
              </h3>
              <p className="text-sm text-gray-400">Your personal success coach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? "Minimize" : "Expand"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBot(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Current Status */}
            <div className="p-4 border-b border-[#c8ff00]/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <currentRank.icon className="w-5 h-5" style={{ color: currentRank.color }} />
                  <span className="font-semibold text-white">{currentStats.currentRank}</span>
                </div>
                {nextRank && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Next:</span>
                    <nextRank.icon className="w-4 h-4" style={{ color: nextRank.color }} />
                    <span style={{ color: nextRank.color }}>{nextRank.name}</span>
                  </div>
                )}
              </div>

              {nextRank && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Personal Volume</span>
                      <span className="text-[#c8ff00]">{currentStats.personalVolume}/{nextRank.pvRequired} PV</span>
                    </div>
                    <Progress value={pvProgress} className="h-2 bg-gray-800" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Team Volume</span>
                      <span className="text-[#c8ff00]">{currentStats.teamVolume.toLocaleString()}/{nextRank.tvRequired.toLocaleString()} TV</span>
                    </div>
                    <Progress value={tvProgress} className="h-2 bg-gray-800" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Lesser Leg Volume</span>
                      <span className="text-[#c8ff00]">{lesserLegVolume.toLocaleString()}/{nextRank.lesserLegRequired.toLocaleString()}</span>
                    </div>
                    <Progress value={legProgress} className="h-2 bg-gray-800" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Items */}
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-sm font-semibold text-white">Your Next Steps</span>
                <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] text-xs">
                  {actionItems.length} actions
                </Badge>
              </div>

              {actionItems.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-white font-semibold">You're on track! 🎉</p>
                  <p className="text-gray-400 text-sm">Keep up the great work, {distributorName}!</p>
                </div>
              ) : (
                actionItems.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 rounded-lg p-3 border border-white/10 hover:border-[#c8ff00]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center flex-shrink-0">
                        <action.icon className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>
                            {action.priority}
                          </Badge>
                          <span className="text-xs text-[#c8ff00]">{action.impact}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1">{action.title}</h4>
                        <p className="text-xs text-gray-400 mb-2">{action.description}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#c8ff00] text-black hover:bg-[#a8d600] text-xs h-7"
                            onClick={() => action.actionLink && (window.location.href = action.actionLink)}
                          >
                            {action.actionLabel}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white text-xs h-7"
                            onClick={() => dismissAction(action.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Rotating Tip */}
            <div className="p-4 bg-[#c8ff00]/5 border-t border-[#c8ff00]/10">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2"
              >
                <Lightbulb className="w-4 h-4 text-[#c8ff00] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300">{tips[currentTip]}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
