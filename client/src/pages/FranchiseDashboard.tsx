import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { getLoginUrl } from "@/const";
import {
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  BarChart3,
  Zap,
  Settings,
  FileText,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Map,
  Store,
  Truck
} from "lucide-react";

export default function FranchiseDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch territory applications for this user
  const { data: applications, isLoading: applicationsLoading } = trpc.territory.listApplications.useQuery(undefined, {
    enabled: !!user,
  });

  // Filter to get user's applications (in a real app, this would be filtered server-side)
  const myApplications = applications?.filter((app: any) => 
    app.email === user?.email || app.userId === user?.id
  ) || [];

  const approvedTerritories = myApplications.filter((app: any) => app.status === 'approved' || app.status === 'active');
  const pendingApplications = myApplications.filter((app: any) => app.status === 'pending' || app.status === 'submitted');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0318] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c8ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0318]">
        <HamburgerHeader variant="default" />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#ff0080]/20 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-[#ff0080]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Franchise Owner Portal
            </h1>
            <p className="text-white/60 mb-8">
              Sign in to access your territory dashboard, manage vending machines, and track your earnings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-[#ff0080] hover:bg-[#ff0080]/90 text-white font-bold px-8 py-6 text-lg"
              >
                Sign In to Dashboard
              </Button>
              <Button
                onClick={() => setLocation("/franchise")}
                variant="outline"
                className="border-[#ff0080]/50 text-[#ff0080] hover:bg-[#ff0080]/10 font-bold px-8 py-6 text-lg"
              >
                Explore Franchise Opportunity
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0318]">
      <HamburgerHeader variant="default" />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[#ff0080]/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#ff0080]" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">
                      Franchise Dashboard
                    </h1>
                    <p className="text-white/50 text-sm">Welcome back, {user.name?.split(' ')[0] || 'Partner'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setLocation("/franchise")}
                  variant="outline"
                  className="border-[#ff0080]/50 text-[#ff0080] hover:bg-[#ff0080]/10"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Apply for New Territory
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white/70 hover:bg-white/5"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-[#ff0080]/20 to-[#ff0080]/5 border-[#ff0080]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="w-5 h-5 text-[#ff0080]" />
                  <Badge variant="outline" className="text-[10px] border-[#ff0080]/50 text-[#ff0080]">
                    Active
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">{approvedTerritories.length}</p>
                <p className="text-xs text-white/50">Territories</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 border-[#c8ff00]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Store className="w-5 h-5 text-[#c8ff00]" />
                  <Badge variant="outline" className="text-[10px] border-[#c8ff00]/50 text-[#c8ff00]">
                    Active
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">0</p>
                <p className="text-xs text-white/50">Vending Machines</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#00ffff]/20 to-[#00ffff]/5 border-[#00ffff]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-[#00ffff]" />
                  <Badge variant="outline" className="text-[10px] border-[#00ffff]/50 text-[#00ffff]">
                    MTD
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">$0</p>
                <p className="text-xs text-white/50">Monthly Revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400">
                    MTD
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">0</p>
                <p className="text-xs text-white/50">Cases Sold</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff0080] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="territories" className="data-[state=active]:bg-[#ff0080] data-[state=active]:text-white">
                Territories
              </TabsTrigger>
              <TabsTrigger value="machines" className="data-[state=active]:bg-[#ff0080] data-[state=active]:text-white">
                Machines
              </TabsTrigger>
              <TabsTrigger value="earnings" className="data-[state=active]:bg-[#ff0080] data-[state=active]:text-white">
                Earnings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Applications Status */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#ff0080]" />
                      Application Status
                    </CardTitle>
                    <CardDescription>Track your territory applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applicationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
                      </div>
                    ) : myApplications.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 mb-4">No applications yet</p>
                        <Button
                          onClick={() => setLocation("/franchise")}
                          className="bg-[#ff0080] hover:bg-[#ff0080]/90"
                        >
                          Apply for Territory
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myApplications.slice(0, 3).map((app: any) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                app.status === 'approved' || app.status === 'active'
                                  ? 'bg-green-500/20'
                                  : app.status === 'rejected'
                                  ? 'bg-red-500/20'
                                  : 'bg-yellow-500/20'
                              }`}>
                                {app.status === 'approved' || app.status === 'active' ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : app.status === 'rejected' ? (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                ) : (
                                  <Clock className="w-5 h-5 text-yellow-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {app.territoryName || app.city || 'Territory Application'}
                                </p>
                                <p className="text-xs text-white/50">
                                  {app.radiusMiles} mile radius • {app.state}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                app.status === 'approved' || app.status === 'active'
                                  ? 'border-green-500/50 text-green-400'
                                  : app.status === 'rejected'
                                  ? 'border-red-500/50 text-red-400'
                                  : 'border-yellow-500/50 text-yellow-400'
                              }`}
                            >
                              {app.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#c8ff00]" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      onClick={() => setLocation("/franchise")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#ff0080]/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#ff0080]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">Apply for Territory</p>
                          <p className="text-xs text-white/50">Claim your exclusive area</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>

                    <button
                      onClick={() => setLocation("/vending")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                          <Store className="w-5 h-5 text-[#c8ff00]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">Order Vending Machine</p>
                          <p className="text-xs text-white/50">Expand your network</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>

                    <button
                      onClick={() => setLocation("/compensation")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00ffff]/20 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-[#00ffff]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">View Comp Plan</p>
                          <p className="text-xs text-white/50">Understand your earnings</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>

                    <button
                      onClick={() => setActiveTab("earnings")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">View Earnings</p>
                          <p className="text-xs text-white/50">Track your revenue</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* Getting Started Guide - Show if no territories */}
              {approvedTerritories.length === 0 && (
                <Card className="bg-gradient-to-r from-[#ff0080]/10 to-purple-500/10 border-[#ff0080]/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-[#ff0080]/20 flex items-center justify-center flex-shrink-0">
                        <Map className="w-10 h-10 text-[#ff0080]" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">
                          Start Your Franchise Journey
                        </h3>
                        <p className="text-white/60 mb-4">
                          Claim your exclusive territory and start earning with NEON vending machines. 
                          Our franchise partners enjoy protected territories and ongoing support.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                          <Button
                            onClick={() => setLocation("/franchise")}
                            className="bg-[#ff0080] hover:bg-[#ff0080]/90 text-white font-bold"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Explore Territories
                          </Button>
                          <Button
                            onClick={() => setLocation("/vending")}
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                          >
                            <Store className="w-4 h-4 mr-2" />
                            View Vending Options
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Territories Tab */}
            <TabsContent value="territories" className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Your Territories</CardTitle>
                      <CardDescription>Manage your exclusive franchise areas</CardDescription>
                    </div>
                    <Button
                      onClick={() => setLocation("/franchise")}
                      className="bg-[#ff0080] hover:bg-[#ff0080]/90"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Add Territory
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {approvedTerritories.length === 0 ? (
                    <div className="text-center py-12">
                      <Map className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Active Territories</h3>
                      <p className="text-white/50 mb-6 max-w-md mx-auto">
                        You don't have any approved territories yet. Apply for a territory to start your franchise journey.
                      </p>
                      <Button
                        onClick={() => setLocation("/franchise")}
                        className="bg-[#ff0080] hover:bg-[#ff0080]/90"
                      >
                        Apply for Territory
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvedTerritories.map((territory: any) => (
                        <div
                          key={territory.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                {territory.territoryName || territory.city}
                              </h4>
                              <p className="text-sm text-white/50">
                                {territory.city}, {territory.state} {territory.zipCode}
                              </p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              Active
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-white/40">Radius</p>
                              <p className="text-sm font-semibold text-white">{territory.radiusMiles} miles</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/40">Machines</p>
                              <p className="text-sm font-semibold text-white">0</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/40">Monthly Revenue</p>
                              <p className="text-sm font-semibold text-[#c8ff00]">$0</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Machines Tab */}
            <TabsContent value="machines" className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Vending Machines</CardTitle>
                      <CardDescription>Manage your NEON vending network</CardDescription>
                    </div>
                    <Button
                      onClick={() => setLocation("/vending")}
                      className="bg-[#c8ff00] hover:bg-[#c8ff00]/90 text-black"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Order Machine
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Machines Yet</h3>
                    <p className="text-white/50 mb-6 max-w-md mx-auto">
                      Order your first NEON vending machine to start generating passive income in your territory.
                    </p>
                    <Button
                      onClick={() => setLocation("/vending")}
                      className="bg-[#c8ff00] hover:bg-[#c8ff00]/90 text-black"
                    >
                      Browse Vending Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xs text-white/40 mb-1">Total Earnings</p>
                    <p className="text-2xl font-black text-white">$0.00</p>
                    <p className="text-xs text-white/50">All time</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xs text-white/40 mb-1">This Month</p>
                    <p className="text-2xl font-black text-[#c8ff00]">$0.00</p>
                    <p className="text-xs text-white/50">January 2026</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xs text-white/40 mb-1">Pending Payout</p>
                    <p className="text-2xl font-black text-[#00ffff]">$0.00</p>
                    <p className="text-xs text-white/50">Next payout: Feb 1</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Earnings History</CardTitle>
                  <CardDescription>Track your franchise revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Earnings Yet</h3>
                    <p className="text-white/50 max-w-md mx-auto">
                      Your earnings will appear here once you have active vending machines generating revenue.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
