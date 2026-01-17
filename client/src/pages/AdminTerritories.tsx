import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building, 
  DollarSign,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowLeft,
  Target,
  Calendar
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import NeonLogo from "@/components/NeonLogo";

export default function AdminTerritories() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  
  // Fetch all territory applications
  const { data: applications = [], isLoading, refetch } = trpc.territory.listApplications.useQuery();
  
  // Mutation for updating status
  const updateStatusMutation = trpc.territory.updateApplicationStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] flex items-center justify-center">
        <Card className="bg-black/50 border-red-500/30 p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="bg-[#c8ff00] text-black hover:bg-[#d4ff33]">
              Return Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter applications
  const filteredApplications = applications.filter((app: any) => {
    const fullName = `${app.firstName || ''} ${app.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      app.territoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Handle status filter - include submitted/under_review in pending filter
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "pending") {
      matchesStatus = app.status === "pending" || app.status === "submitted" || app.status === "under_review";
    } else {
      matchesStatus = app.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (applicationId: number) => {
    await updateStatusMutation.mutateAsync({
      applicationId,
      status: "approved",
      adminNotes: reviewNotes[applicationId] || "Approved",
    });
  };

  const handleReject = async (applicationId: number) => {
    if (!reviewNotes[applicationId]) {
      alert("Please provide a reason for rejection");
      return;
    }
    await updateStatusMutation.mutateAsync({
      applicationId,
      status: "rejected",
      adminNotes: reviewNotes[applicationId],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
      case "under_review":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Eye className="w-3 h-3 mr-1" /> Under Review</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === "pending" || a.status === "submitted" || a.status === "under_review").length,
    approved: applications.filter((a: any) => a.status === "approved").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  const canReview = (status: string) => {
    return status === "pending" || status === "submitted" || status === "under_review";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#c8ff00]/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <NeonLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/distributor">
              <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-white">Territory </span>
              <span className="text-[#c8ff00]">Management</span>
            </h1>
            <p className="text-xl text-gray-400">Review and manage territory applications</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#c8ff00]/20">
                  <Target className="w-6 h-6 text-[#c8ff00]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Applications</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.pending}</div>
                  <div className="text-sm text-gray-400">Pending Review</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.approved}</div>
                  <div className="text-sm text-gray-400">Approved</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.rejected}</div>
                  <div className="text-sm text-gray-400">Rejected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-black/50 border-[#c8ff00]/20 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    placeholder="Search by territory, name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/50 border-[#c8ff00]/30 text-white"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    className={statusFilter === "all" ? "bg-[#c8ff00] text-black" : "border-[#c8ff00]/30 text-gray-400"}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                    className={statusFilter === "pending" ? "bg-yellow-500 text-black" : "border-yellow-500/30 text-gray-400"}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === "approved" ? "default" : "outline"}
                    onClick={() => setStatusFilter("approved")}
                    className={statusFilter === "approved" ? "bg-green-500 text-black" : "border-green-500/30 text-gray-400"}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === "rejected" ? "default" : "outline"}
                    onClick={() => setStatusFilter("rejected")}
                    className={statusFilter === "rejected" ? "bg-red-500 text-black" : "border-red-500/30 text-gray-400"}
                  >
                    Rejected
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="border-[#c8ff00]/30 text-[#c8ff00]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#c8ff00]/30 border-t-[#c8ff00] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="bg-black/50 border-[#c8ff00]/20">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
                <p className="text-gray-400">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "No territory applications have been submitted yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredApplications.map((app: any) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-black/50 border-[#c8ff00]/20 overflow-hidden">
                      <CardHeader 
                        className="cursor-pointer hover:bg-[#c8ff00]/5 transition-colors"
                        onClick={() => setExpandedApplication(expandedApplication === app.id ? null : app.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-[#c8ff00]/10">
                              <MapPin className="w-6 h-6 text-[#c8ff00]" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-white">{app.territoryName || "Unnamed Territory"}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {app.firstName} {app.lastName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  ${app.totalCost?.toLocaleString() || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(app.status)}
                            {expandedApplication === app.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <AnimatePresence>
                        {expandedApplication === app.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="border-t border-[#c8ff00]/20 p-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Territory Details */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-[#c8ff00] flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Territory Details
                                  </h4>
                                  <div className="bg-black/30 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Location</span>
                                      <span className="text-white">{app.territoryName || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Radius</span>
                                      <span className="text-white">{app.radiusMiles || "N/A"} miles</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Est. Population</span>
                                      <span className="text-white">{app.estimatedPopulation?.toLocaleString() || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Term</span>
                                      <span className="text-white">{app.termMonths || "N/A"} months</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">License Cost</span>
                                      <span className="text-[#c8ff00] font-bold">${app.totalCost?.toLocaleString() || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Applicant Details */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-[#00ffff] flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Applicant Details
                                  </h4>
                                  <div className="bg-black/30 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-gray-500" />
                                      <span className="text-white">{app.firstName} {app.lastName}</span>
                                    </div>
                                    {app.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <a href={`mailto:${app.email}`} className="text-[#00ffff] hover:underline">
                                          {app.email}
                                        </a>
                                      </div>
                                    )}
                                    {app.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <a href={`tel:${app.phone}`} className="text-white hover:text-[#c8ff00]">
                                          {app.phone}
                                        </a>
                                      </div>
                                    )}
                                    {app.businessName && (
                                      <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <span className="text-white">{app.businessName}</span>
                                      </div>
                                    )}
                                    {app.city && app.state && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-white">{app.city}, {app.state} {app.zipCode}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Business Info */}
                              {(app.whyInterested || app.franchiseExperience) && (
                                <div className="mt-6">
                                  <h4 className="font-semibold text-[#ff0080] flex items-center gap-2 mb-3">
                                    <Building className="w-4 h-4" />
                                    Business Information
                                  </h4>
                                  <div className="bg-black/30 rounded-lg p-4 space-y-3">
                                    {app.businessType && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Business Type</span>
                                        <span className="text-white capitalize">{app.businessType}</span>
                                      </div>
                                    )}
                                    {app.yearsInBusiness && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Years in Business</span>
                                        <span className="text-white">{app.yearsInBusiness}</span>
                                      </div>
                                    )}
                                    {app.investmentCapital && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Investment Capital</span>
                                        <span className="text-white">${app.investmentCapital.toLocaleString()}</span>
                                      </div>
                                    )}
                                    {app.whyInterested && (
                                      <div className="pt-2 border-t border-gray-700">
                                        <span className="text-gray-400 block mb-1">Why Interested</span>
                                        <p className="text-gray-300">{app.whyInterested}</p>
                                      </div>
                                    )}
                                    {app.franchiseExperience && (
                                      <div className="pt-2 border-t border-gray-700">
                                        <span className="text-gray-400 block mb-1">Franchise Experience</span>
                                        <p className="text-gray-300">{app.franchiseExperience}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Admin Actions */}
                              {canReview(app.status) && (
                                <div className="mt-6 pt-6 border-t border-[#c8ff00]/20">
                                  <h4 className="font-semibold text-white mb-3">Review Notes</h4>
                                  <Textarea
                                    placeholder="Add notes for this application (required for rejection)..."
                                    value={reviewNotes[app.id] || ""}
                                    onChange={(e) => setReviewNotes({ ...reviewNotes, [app.id]: e.target.value })}
                                    className="bg-black/50 border-[#c8ff00]/30 text-white mb-4"
                                    rows={3}
                                  />
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleApprove(app.id)}
                                      disabled={updateStatusMutation.isPending}
                                      className="flex-1 bg-green-500 text-white hover:bg-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      {updateStatusMutation.isPending ? "Processing..." : "Approve Application"}
                                    </Button>
                                    <Button
                                      onClick={() => handleReject(app.id)}
                                      disabled={updateStatusMutation.isPending}
                                      variant="outline"
                                      className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      {updateStatusMutation.isPending ? "Processing..." : "Reject Application"}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes Display */}
                              {app.adminNotes && (app.status === "approved" || app.status === "rejected") && (
                                <div className="mt-6 pt-6 border-t border-[#c8ff00]/20">
                                  <h4 className="font-semibold text-white mb-2">Admin Notes</h4>
                                  <div className="bg-black/30 rounded-lg p-4">
                                    <p className="text-gray-300">{app.adminNotes}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
