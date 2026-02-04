import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Download, 
  TrendingUp, 
  Activity,
  UserPlus,
  DollarSign,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import GenealogyTree from "./GenealogyTree";
import { MobileGenealogyTree } from "./MobileGenealogyTree";
import { formatDistanceToNow } from "date-fns";

export default function MyTeam() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"tree" | "list">("tree");
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch team data
  const { data: teamData, isLoading } = trpc.distributor.team.useQuery();
  const { data: stats } = trpc.distributor.stats.useQuery();
  
  // Fetch genealogy data for mobile tree
  const { data: genealogyData, isLoading: genealogyLoading } = trpc.distributor.genealogy.useQuery({ depth: 5 });
  
  // Filter team members based on search
  const filteredTeam = teamData?.filter((member: any) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamSize || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{(stats as any)?.newMembersThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any)?.activeMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(((stats as any)?.activeMembers || 0) / (stats?.teamSize || 1) * 100).toFixed(0)}% of team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats as any)?.teamSales?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any)?.topPerformer?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              ${(stats as any)?.topPerformer?.sales || 0} in sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Switcher */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Team</CardTitle>
              <CardDescription>View and manage your team structure</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "tree" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("tree")}
              >
                Tree View
              </Button>
              <Button
                variant={activeView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("list")}
              >
                List View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeView === "tree" ? (
            isMobile ? (
              <MobileGenealogyTree 
                genealogyData={genealogyData}
                rootMember={genealogyData ? undefined : {
                  id: stats?.distributor?.distributorCode || "DIST001",
                  name: "You",
                  rank: stats?.distributor?.rank || "STARTER",
                  position: "root",
                  personalVolume: stats?.distributor?.personalSales || 0,
                  teamVolume: stats?.distributor?.teamSales || 0,
                  leftChild: null,
                  rightChild: null
                }}
                isLoading={isLoading || genealogyLoading}
                onEnrollClick={(position, parentId) => {
                  console.log(`Enroll at ${position} under ${parentId}`);
                  // TODO: Navigate to enrollment page
                }}
              />
            ) : (
              <GenealogyTree />
            )
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Team Member List */}
              <div className="space-y-3">
                {filteredTeam && filteredTeam.length > 0 ? (
                  filteredTeam.map((member: any) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{member.name}</h4>
                                <Badge variant={member.isActive ? "default" : "secondary"}>
                                  {member.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{member.rank}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </span>
                                {member.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {member.phone}
                                  </span>
                                )}
                                {member.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {member.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Personal Sales: ${member.personalSales?.toLocaleString() || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Team Size: {member.teamSize || 0}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search" : "Start building your team by sharing your referral link"}
                    </p>
                    {!searchQuery && (
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Team Members
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Growth</CardTitle>
          <CardDescription>Track your team's growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Team growth chart coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
