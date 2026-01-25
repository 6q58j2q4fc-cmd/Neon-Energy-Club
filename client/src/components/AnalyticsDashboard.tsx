import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target, Users, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AnalyticsInsight {
  category: "performance" | "growth" | "commission" | "team" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  suggestedAction?: string;
}

const CATEGORY_ICONS = {
  performance: TrendingUp,
  growth: Users,
  commission: DollarSign,
  team: Users,
  recommendation: Lightbulb,
};

const CATEGORY_COLORS = {
  performance: "text-blue-400",
  growth: "text-green-400",
  commission: "text-yellow-400",
  team: "text-purple-400",
  recommendation: "text-[#c8ff00]",
};

const PRIORITY_COLORS = {
  high: "border-red-500/50 bg-red-500/10",
  medium: "border-yellow-500/50 bg-yellow-500/10",
  low: "border-gray-500/50 bg-gray-500/10",
};

export function AnalyticsDashboard() {
  const { data: insights, isLoading: insightsLoading } = trpc.distributor.analyticsInsights.useQuery();
  const { data: teamAnalysis, isLoading: teamLoading } = trpc.distributor.teamAnalysis.useQuery({ timeframe: "month" });
  const { data: commissionTips, isLoading: tipsLoading } = trpc.distributor.commissionOptimization.useQuery();

  if (insightsLoading || teamLoading || tipsLoading) {
    return (
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c8ff00]" />
          <p className="mt-4 text-gray-400">Analyzing your business performance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#c8ff00]" />
            <CardTitle>AI-Powered Insights</CardTitle>
          </div>
          <CardDescription>Personalized recommendations to grow your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights && insights.length > 0 ? (
            insights.map((insight: AnalyticsInsight, index: number) => {
              const Icon = CATEGORY_ICONS[insight.category];
              const colorClass = CATEGORY_COLORS[insight.category];
              const priorityClass = PRIORITY_COLORS[insight.priority];

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${priorityClass} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-1 ${colorClass} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        <Badge variant="outline" className={`text-xs ${colorClass} border-current`}>
                          {insight.category}
                        </Badge>
                        {insight.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{insight.description}</p>
                      {insight.actionable && insight.suggestedAction && (
                        <div className="flex items-start gap-2 p-3 bg-[#c8ff00]/10 rounded-md border border-[#c8ff00]/20">
                          <Target className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-[#c8ff00]">{insight.suggestedAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="text-gray-400">Your business is performing well!</p>
              <p className="text-sm text-gray-500">Keep up the great work.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Analysis */}
      {teamAnalysis && (
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <CardTitle>Team Performance Analysis</CardTitle>
            </div>
            <CardDescription>AI analysis of your team's recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{teamAnalysis}</p>
          </CardContent>
        </Card>
      )}

      {/* Commission Optimization */}
      {commissionTips && commissionTips.length > 0 && (
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <CardTitle>Commission Optimization Tips</CardTitle>
            </div>
            <CardDescription>Maximize your earnings with these strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {commissionTips.map((tip: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-300 flex-1">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
