import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Target, Award } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function ImpactAnalytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [metric, setMetric] = useState<"trees" | "animals" | "habitat" | "species">("trees");

  const { data: lifetime, isLoading: lifetimeLoading } = trpc.impact.getLifetime.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.impact.getHistory.useQuery({
    limit: timeRange === "7d" ? 7 : timeRange === "30d" ? 12 : timeRange === "90d" ? 12 : 12
  });
  const { data: achievements, isLoading: achievementsLoading } = trpc.impact.getAchievements.useQuery();
  const { data: nextMilestone } = trpc.impact.getNextMilestone.useQuery({ category: metric });

  // Transform history data for charts
  const chartData = history?.map((h, idx) => ({
    name: `Period ${idx + 1}`,
    trees: h.treesProtected || 0,
    animals: h.animalLivesSaved || 0,
    habitat: h.habitatProtected || 0,
    species: h.treesProtected || 0,
    total: (h.treesProtected || 0) + (h.animalLivesSaved || 0) + (h.habitatProtected || 0) + (h.treesProtected || 0)
  })) || [];

  // Category distribution for pie chart
  const categoryData = [
    { name: "Trees", value: lifetime?.treesProtected || 0, color: "#22c55e" },
    { name: "Animals", value: lifetime?.animalLivesSaved || 0, color: "#ec4899" },
    { name: "Habitat", value: lifetime?.habitatProtected || 0, color: "#3b82f6" },
    { name: "Species", value: lifetime?.treesProtected || 0, color: "#a855f7" }
  ].filter(d => d.value > 0);

  // Achievement progress
  const achievementProgress = achievements ? {
    total: achievements.length,
    trees: achievements.filter(a => a.milestone.category === 'trees').length,
    animals: achievements.filter(a => a.milestone.category === 'animals').length,
    team: achievements.filter(a => a.milestone.category === 'team').length
  } : null;

  if (lifetimeLoading || historyLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Impact Analytics</h1>
          <p className="text-muted-foreground">Track your environmental impact over time</p>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trees Protected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetime?.treesProtected || 0}</div>
            <p className="text-xs text-muted-foreground">
              {achievementProgress?.trees || 0} milestones achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animals Saved</CardTitle>
            <Award className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetime?.animalLivesSaved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {achievementProgress?.animals || 0} milestones achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habitat Protected</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lifetime?.habitatProtected || 0} sq ft</div>
            <p className="text-xs text-muted-foreground">
              Rainforest preservation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievementProgress?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Milestones unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Impact Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="progress">Milestone Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact Over Time</CardTitle>
              <CardDescription>
                Your environmental contributions across all categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTrees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAnimals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="trees" stroke="#22c55e" fillOpacity={1} fill="url(#colorTrees)" name="Trees" />
                  <Area type="monotone" dataKey="animals" stroke="#ec4899" fillOpacity={1} fill="url(#colorAnimals)" name="Animals" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Impact Growth</CardTitle>
              <CardDescription>
                Combined environmental impact across all metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total Impact" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impact Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your contributions by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>
                  Compare your impact across different categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Milestone</CardTitle>
              <CardDescription>
                Your progress toward the next achievement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextMilestone ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{nextMilestone.milestone.icon}</div>
                    <div>
                      <h3 className="font-semibold">{nextMilestone.milestone.name}</h3>
                      <p className="text-sm text-muted-foreground">{nextMilestone.milestone.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{nextMilestone.currentValue} / {nextMilestone.milestone.threshold}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all" 
                        style={{ width: `${nextMilestone.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {nextMilestone.remaining} more to go!
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">All milestones achieved in this category!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
              <CardDescription>
                Milestones unlocked by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🌳 Tree Protection</span>
                  <span className="text-sm text-muted-foreground">{achievementProgress?.trees || 0} / 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">💗 Animal Lives</span>
                  <span className="text-sm text-muted-foreground">{achievementProgress?.animals || 0} / 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">👥 Team Impact</span>
                  <span className="text-sm text-muted-foreground">{achievementProgress?.team || 0} / 3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
