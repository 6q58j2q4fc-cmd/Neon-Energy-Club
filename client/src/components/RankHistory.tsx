import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankBadge, RankIcon } from "@/components/RankBadge";
import { History, ArrowRight, Calendar, TrendingUp, Award } from "lucide-react";

export function RankHistory() {
  const { data: rankHistory, isLoading } = trpc.distributor.rankHistory.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rankHistory || rankHistory.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#39FF14]" />
            Rank History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-400">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Rank Changes Yet</p>
            <p className="text-sm">
              Your rank history will appear here as you achieve new milestones.
              Keep building your team and growing your business!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[#39FF14]" />
          Rank History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-700" />
          
          {/* Timeline items */}
          <div className="space-y-6">
            {rankHistory.map((record, index) => (
              <div key={record.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                  index === 0 
                    ? "bg-[#39FF14]/20 border-2 border-[#39FF14]" 
                    : "bg-zinc-800 border-2 border-zinc-700"
                }`}>
                  <RankIcon rank={record.newRank} size="sm" />
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RankBadge rank={record.previousRank} size="sm" />
                    <ArrowRight className="w-4 h-4 text-[#39FF14]" />
                    <RankBadge rank={record.newRank} size="sm" />
                    {index === 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[#39FF14]/20 text-[#39FF14] rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(record.achievedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {record.personalPvAtChange?.toLocaleString() || 0} PV / 
                        ${((record.teamPvAtChange || 0) / 100).toLocaleString()} Team
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-white">
                    🎉 Congratulations! You advanced from{" "}
                    <span className="font-semibold capitalize">{record.previousRank}</span> to{" "}
                    <span className="font-semibold text-[#39FF14] capitalize">{record.newRank}</span>!
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-zinc-700">
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Achievement Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-[#39FF14]">{rankHistory.length}</div>
              <div className="text-xs text-zinc-400">Rank Advances</div>
            </div>
            <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white capitalize">
                {rankHistory[0]?.newRank || "Starter"}
              </div>
              <div className="text-xs text-zinc-400">Current Rank</div>
            </div>
            <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {rankHistory.length > 0 
                  ? Math.floor((Date.now() - new Date(rankHistory[rankHistory.length - 1].achievedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : 0}
              </div>
              <div className="text-xs text-zinc-400">Days Since First Advance</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RankHistory;
