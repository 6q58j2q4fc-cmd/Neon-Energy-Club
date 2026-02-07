import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Users, Leaf, Home, Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ImpactLeaderboard() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<'personal' | 'team' | 'total'>('total');
  const [selectedMetric, setSelectedMetric] = useState<'trees' | 'habitat' | 'species' | 'animals'>('trees');

  const { data: leaderboard, isLoading } = trpc.impact.getLeaderboard.useQuery({
    type: selectedType,
    metric: selectedMetric,
    limit: 50,
  });

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'trees':
        return <Leaf className="w-5 h-5" />;
      case 'habitat':
        return <Home className="w-5 h-5" />;
      case 'species':
        return <Sparkles className="w-5 h-5" />;
      case 'animals':
        return <Heart className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'trees':
        return 'Trees Protected';
      case 'habitat':
        return 'Habitat Protected (sq ft)';
      case 'species':
        return 'Species Saved';
      case 'animals':
        return 'Animal Lives Saved';
      default:
        return 'Impact';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-2xl font-bold text-yellow-400">1st</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-300" />
          <span className="text-xl font-bold text-gray-300">2nd</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-400" />
          <span className="text-xl font-bold text-orange-400">3rd</span>
        </div>
      );
    }
    return (
      <span className="text-lg font-semibold text-gray-400">#{rank}</span>
    );
  };

  const getMetricValue = (leader: any) => {
    const columnMap: Record<string, string> = {
      trees: 'TreesProtected',
      habitat: 'HabitatProtected',
      species: 'SpeciesSaved',
      animals: 'AnimalLivesSaved',
    };

    const column = `${selectedType}${columnMap[selectedMetric]}`;
    const value = parseFloat(leader[column] || '0');
    
    return Math.floor(value).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-[#c8ff00]" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Impact Leaderboard
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Celebrating our top environmental champions making a real difference for the planet
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-[#0d2818]/50 border-[#c8ff00]/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Impact Type Filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Impact Type
                </label>
                <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-[#0a1a1a]">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      <Users className="w-4 h-4 mr-1" />
                      Team
                    </TabsTrigger>
                    <TabsTrigger value="total" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      Total
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Metric Filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Metric
                </label>
                <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as any)}>
                  <TabsList className="grid w-full grid-cols-4 bg-[#0a1a1a]">
                    <TabsTrigger value="trees" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      🌳
                    </TabsTrigger>
                    <TabsTrigger value="habitat" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      🏕️
                    </TabsTrigger>
                    <TabsTrigger value="species" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      🐸
                    </TabsTrigger>
                    <TabsTrigger value="animals" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      💗
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-[#0d2818]/50 border-[#c8ff00]/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              {getMetricIcon(selectedMetric)}
              Top {getMetricLabel(selectedMetric)} Contributors
            </CardTitle>
            <CardDescription className="text-white/60">
              Showing top 50 distributors for current month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8ff00]"></div>
                <p className="mt-4 text-white/60">Loading leaderboard...</p>
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No data available yet. Start making an impact!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((leader: any, index: number) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;

                  return (
                    <div
                      key={leader.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        isTopThree
                          ? 'bg-gradient-to-r from-[#c8ff00]/20 to-transparent border border-[#c8ff00]/30'
                          : 'bg-[#0a1a1a]/50 hover:bg-[#0a1a1a]/70'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-16 text-center">
                        {getRankBadge(rank)}
                      </div>

                      {/* Distributor Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {leader.distributorName || 'Anonymous'}
                          </h3>
                          {leader.distributorRank && (
                            <Badge variant="outline" className="text-[#c8ff00] border-[#c8ff00]/50">
                              {leader.distributorRank}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Impact Value */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#c8ff00]">
                          {getMetricValue(leader)}
                        </div>
                        <div className="text-sm text-white/60">
                          {getMetricLabel(selectedMetric)}
                        </div>
                      </div>

                      {/* Trending Indicator for Top 10 */}
                      {rank <= 10 && (
                        <div className="flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6 bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Want to see your name here?
              </h3>
              <p className="text-white/70 mb-4">
                Every NEON Energy drink you enjoy contributes to real environmental impact.
                Build your team and multiply your contribution!
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/products'}
                  className="px-6 py-3 bg-[#c8ff00] text-black font-semibold rounded-lg hover:bg-[#b8ef00] transition-colors"
                >
                  Shop NEON Products
                </button>
                <button
                  onClick={() => window.location.href = '/charity-impact'}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                >
                  View My Impact
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
