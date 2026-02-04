import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Wrench, 
  ExternalLink,
  Activity,
  Users,
  Link as LinkIcon,
  Server
} from "lucide-react";
import { toast } from "sonner";

export function AdminWebsiteHealth() {
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);

  const { data: provisioningStatus, isLoading, refetch } = trpc.admin.getWebsiteProvisioningStatus.useQuery();
  
  const runHealthCheck = trpc.admin.runWebsiteHealthCheck.useMutation({
    onSuccess: (data) => {
      toast.success(`Health check complete: ${data.issuesFound} issues found`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Health check failed: ${error.message}`);
    },
    onSettled: () => setIsRunningHealthCheck(false),
  });

  const autoFix = trpc.admin.autoFixWebsiteIssues.useMutation({
    onSuccess: (data) => {
      toast.success(`Auto-fix complete: ${data.fixed} issues fixed`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Auto-fix failed: ${error.message}`);
    },
    onSettled: () => setIsAutoFixing(false),
  });

  const provisionWebsite = trpc.admin.provisionWebsiteForDistributor.useMutation({
    onSuccess: () => {
      toast.success("Website provisioned successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Provisioning failed: ${error.message}`);
    },
  });

  const handleHealthCheck = () => {
    setIsRunningHealthCheck(true);
    runHealthCheck.mutate();
  };

  const handleAutoFix = () => {
    setIsAutoFixing(true);
    autoFix.mutate();
  };

  const handleProvision = (distributorId: number) => {
    provisionWebsite.mutate({ distributorId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-[#c8ff00]" />
        <span className="ml-2">Loading website health data...</span>
      </div>
    );
  }

  const summary = provisioningStatus?.summary;
  const distributors = provisioningStatus?.distributors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#c8ff00]" />
            Website Health Monitor
          </h2>
          <p className="text-gray-400 mt-1">
            Monitor and manage replicated website provisioning for all distributors
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleHealthCheck}
            disabled={isRunningHealthCheck}
            variant="outline"
            className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10"
          >
            {isRunningHealthCheck ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            Run Health Check
          </Button>
          <Button
            onClick={handleAutoFix}
            disabled={isAutoFixing || (summary?.withIssues || 0) === 0}
            className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
          >
            {isAutoFixing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wrench className="w-4 h-4 mr-2" />
            )}
            Auto-Fix All Issues
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Distributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary?.totalDistributors || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              With Websites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{summary?.withWebsites || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              With Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{summary?.withIssues || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-[#c8ff00]">{summary?.healthScore || 100}%</div>
            </div>
            <Progress 
              value={summary?.healthScore || 100} 
              className="mt-2 h-2 bg-gray-800"
            />
          </CardContent>
        </Card>
      </div>

      {/* Distributor Website Status Table */}
      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Distributor Website Status</CardTitle>
          <CardDescription>
            View and manage replicated websites for each distributor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Distributor Code</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subdomain</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Affiliate Link</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Issues</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No distributors found
                    </td>
                  </tr>
                ) : (
                  distributors.map((dist) => (
                    <tr key={dist.distributorId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[#c8ff00]">{dist.distributorCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        {dist.hasWebsite ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {dist.websiteStatus}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Not Provisioned
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {dist.subdomain ? (
                          <span className="text-gray-300 font-mono text-sm">{dist.subdomain}</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {dist.affiliateLink ? (
                          <a 
                            href={dist.affiliateLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#c8ff00] hover:underline flex items-center gap-1 text-sm"
                          >
                            <LinkIcon className="w-3 h-3" />
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {dist.issues.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {dist.issues.map((issue, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs border-yellow-500/30 text-yellow-400"
                              >
                                {issue.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            No issues
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {!dist.hasWebsite && (
                          <Button
                            size="sm"
                            onClick={() => handleProvision(dist.distributorId)}
                            disabled={provisionWebsite.isPending}
                            className="bg-[#c8ff00] text-black hover:bg-[#a8d600] text-xs"
                          >
                            {provisionWebsite.isPending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              "Provision"
                            )}
                          </Button>
                        )}
                        {dist.hasWebsite && dist.issues.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProvision(dist.distributorId)}
                            disabled={provisionWebsite.isPending}
                            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                          >
                            {provisionWebsite.isPending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              "Re-provision"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-[#c8ff00]/10 border-[#c8ff00]/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#c8ff00] mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Automatic Provisioning Active</h4>
              <p className="text-gray-400 text-sm">
                New distributors automatically receive a replicated website with unique subdomain, 
                affiliate tracking link, and SEO optimization upon enrollment. The system continuously 
                monitors for data drift and automatically fixes issues to ensure all distributor websites 
                remain functional and properly tracked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
