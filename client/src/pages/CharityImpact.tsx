import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine, Home, Bird, Heart, TrendingUp, Award, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CharityImpact() {
  const { t, language } = useLanguage();
  const { data: summary, isLoading: summaryLoading } = trpc.impact.getSummary.useQuery({});
  const { data: lifetime, isLoading: lifetimeLoading } = trpc.impact.getLifetime.useQuery();
  const { data: milestones, isLoading: milestonesLoading } = trpc.impact.checkMilestones.useQuery();

  if (summaryLoading || lifetimeLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Your Environmental Impact</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Environmental Impact</h1>
        <p className="text-muted-foreground">
          Every NEON you drink helps protect rainforests and save animal lives
        </p>
      </div>

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {milestones.map((milestone, index) => (
                <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                  {milestone}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="current" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">This Month</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {summary && (
            <>
              {/* NEON Original Impact */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <TreePine className="h-6 w-6 text-green-600" />
                  NEON Original Impact
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Help protect animals and habitats in the world's rainforests every time you drink NEON Original. 
                  Each can protects 0.5 trees, 10 sq ft of habitat, and helps save 0.1 species.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Trees Protected</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <TreePine className="h-6 w-6 text-green-600" />
                        {formatNumber(summary.total.treesProtected)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Personal:</span>
                          <span className="font-medium">{formatNumber(summary.personal.treesProtected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team:</span>
                          <span className="font-medium">{formatNumber(summary.team.treesProtected)}</span>
                        </div>
                      </div>
                      <Progress 
                        value={(summary.personal.treesProtected / summary.total.treesProtected) * 100} 
                        className="mt-3" 
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Habitat Protected</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <Home className="h-6 w-6 text-emerald-600" />
                        {formatNumber(summary.total.habitatProtected)} sq ft
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Personal:</span>
                          <span className="font-medium">{formatNumber(summary.personal.habitatProtected)} sq ft</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team:</span>
                          <span className="font-medium">{formatNumber(summary.team.habitatProtected)} sq ft</span>
                        </div>
                      </div>
                      <Progress 
                        value={(summary.personal.habitatProtected / summary.total.habitatProtected) * 100} 
                        className="mt-3" 
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Species Lives Saved</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <Bird className="h-6 w-6 text-blue-600" />
                        {formatNumber(summary.total.speciesSaved)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Personal:</span>
                          <span className="font-medium">{formatNumber(summary.personal.speciesSaved)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team:</span>
                          <span className="font-medium">{formatNumber(summary.team.speciesSaved)}</span>
                        </div>
                      </div>
                      <Progress 
                        value={(summary.personal.speciesSaved / summary.total.speciesSaved) * 100} 
                        className="mt-3" 
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* NEON Pink Impact */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-600" />
                  NEON Pink Impact
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Help save animal lives in the world's rainforests every time you drink NEON Pink. 
                  Each can helps save 0.25 animal lives.
                </p>

                <div className="grid gap-4 md:grid-cols-1">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Animal Lives Saved</CardDescription>
                      <CardTitle className="text-4xl flex items-center gap-2">
                        <Heart className="h-8 w-8 text-pink-600" />
                        {formatNumber(summary.total.animalLivesSaved)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Personal Impact</div>
                          <div className="text-2xl font-semibold">{formatNumber(summary.personal.animalLivesSaved)}</div>
                          <div className="text-xs text-muted-foreground">{summary.personal.cansPink} cans</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Team Impact</div>
                          <div className="text-2xl font-semibold">{formatNumber(summary.team.animalLivesSaved)}</div>
                          <div className="text-xs text-muted-foreground">{summary.team.cansPink} cans</div>
                        </div>
                      </div>
                      <Progress 
                        value={(summary.personal.animalLivesSaved / summary.total.animalLivesSaved) * 100} 
                        className="mt-4" 
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Cans Consumed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cans Consumed This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{summary.personal.cansOriginal}</div>
                      <div className="text-xs text-muted-foreground">Personal Original</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{summary.personal.cansPink}</div>
                      <div className="text-xs text-muted-foreground">Personal Pink</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{summary.team.cansOriginal}</div>
                      <div className="text-xs text-muted-foreground">Team Original</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{summary.team.cansPink}</div>
                      <div className="text-xs text-muted-foreground">Team Pink</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="lifetime" className="space-y-6">
          {lifetime && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Lifetime Trees Protected</CardDescription>
                    <CardTitle className="text-3xl flex items-center gap-2">
                      <TreePine className="h-6 w-6 text-green-600" />
                      {formatNumber(lifetime.treesProtected)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      From {lifetime.cansOriginal} NEON Original cans
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Lifetime Habitat Protected</CardDescription>
                    <CardTitle className="text-3xl flex items-center gap-2">
                      <Home className="h-6 w-6 text-emerald-600" />
                      {formatNumber(lifetime.habitatProtected)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Square feet of rainforest
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Lifetime Species Saved</CardDescription>
                    <CardTitle className="text-3xl flex items-center gap-2">
                      <Bird className="h-6 w-6 text-blue-600" />
                      {formatNumber(lifetime.speciesSaved)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Species protected from extinction
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Lifetime Animals Saved</CardDescription>
                    <CardTitle className="text-3xl flex items-center gap-2">
                      <Heart className="h-6 w-6 text-pink-600" />
                      {formatNumber(lifetime.animalLivesSaved)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      From {lifetime.cansPink} NEON Pink cans
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Total Lifetime Impact</CardTitle>
                  <CardDescription>
                    Your combined personal and team contribution to environmental conservation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {formatNumber(lifetime.cansOriginal + lifetime.cansPink)}
                    </div>
                    <div className="text-muted-foreground">Total NEON cans consumed</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multiply Your Impact
          </CardTitle>
          <CardDescription>
            Build your team and amplify your environmental contribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Every team member you recruit multiplies your impact. When your team drinks NEON, 
            you contribute to protecting more rainforests and saving more animal lives.
          </p>
          <div className="flex gap-4">
            <button className="btn btn-primary">
              Share Your Impact
            </button>
            <button className="btn btn-outline">
              Invite Team Members
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
