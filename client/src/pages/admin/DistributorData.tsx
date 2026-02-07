import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Search, Download } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function DistributorData() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [revealedTaxInfo, setRevealedTaxInfo] = useState<Set<number>>(new Set());

  // Redirect if not admin
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: distributors, isLoading: distributorsLoading } = trpc.distributor.listAll.useQuery({
    status: "all",
  });

  const { data: customers, isLoading: customersLoading } = trpc.user.profile.useQuery();

  const toggleTaxInfoReveal = (distributorId: number) => {
    setRevealedTaxInfo((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(distributorId)) {
        newSet.delete(distributorId);
      } else {
        newSet.add(distributorId);
      }
      return newSet;
    });
  };

  const maskSSN = (ssn: string | null) => {
    if (!ssn) return "Not provided";
    return `***-**-${ssn.slice(-4)}`;
  };

  const maskEIN = (ein: string | null) => {
    if (!ein) return "Not provided";
    return `**-***${ein.slice(-4)}`;
  };

  const formatBusinessEntity = (entity: string | null) => {
    if (!entity) return "Individual";
    return entity.toUpperCase();
  };

  const filteredDistributors = distributors?.filter((d) =>
    d.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.distributorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((d as any).businessName ?? "N/A").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Distributor & Customer Data</h1>
        <p className="text-muted-foreground">
          Secure view of all distributor and customer information with encrypted tax data
        </p>
      </div>

      <Tabs defaultValue="distributors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="distributors">
            Distributors
            {distributors && (
              <Badge variant="secondary" className="ml-2">
                {distributors.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="customers">
            Customers
            <Badge variant="secondary" className="ml-2">
              0
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distributors" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Distributor Database</CardTitle>
                  <CardDescription>
                    View and manage all distributor records with secure tax information
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or business name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {distributorsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading distributors...</div>
              ) : filteredDistributors && filteredDistributors.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Business Entity</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Tax ID</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Autoship</TableHead>
                        <TableHead>Commission Eligible</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDistributors.map((distributor) => (
                        <TableRow key={distributor.id}>
                          <TableCell className="font-mono text-sm">
                            {distributor.distributorCode}
                          </TableCell>
                          <TableCell>{distributor.username || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{distributor.rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                distributor.status === "active"
                                  ? "default"
                                  : distributor.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {distributor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatBusinessEntity(distributor.businessEntityType ?? "N/A")}
                          </TableCell>
                          <TableCell>{(distributor.businessName ?? "N/A") || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {revealedTaxInfo.has(distributor.id) ? (
                              <span className="text-destructive">
                                {(distributor.taxIdType ?? "N/A") === "ssn"
                                  ? distributor.ssnLast4 ?? "N/A"
                                    ? `***-**-${distributor.ssnLast4 ?? "N/A"}`
                                    : "Not provided"
                                  : distributor.einLast4 ?? "N/A"
                                  ? `**-***${distributor.einLast4 ?? "N/A"}`
                                  : "Not provided"}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {(distributor.taxIdType ?? "N/A") === "ssn"
                                  ? maskSSN(distributor.ssnLast4 ?? "N/A")
                                  : maskEIN(distributor.einLast4 ?? "N/A")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(distributor as any).enrollmentPackageId ? (
                              <Badge variant="secondary">Package #{(distributor as any).enrollmentPackageId}</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {(distributor as any).autoshipEnabled ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {(distributor as any).autoshipEnabled ? (
                              <Badge className="bg-green-500">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTaxInfoReveal(distributor.id)}
                            >
                              {revealedTaxInfo.has(distributor.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No distributors match your search" : "No distributors found"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>
                View and manage all customer records and purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">Customer database coming soon</p>
                <p className="text-sm">
                  This section will display all customer records, purchase history, and referral data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              🔒 All tax information (SSN/EIN) is encrypted using AES-256-GCM encryption and stored
              securely in the database.
            </p>
            <p>
              👁️ Tax IDs are masked by default. Click the eye icon to reveal the last 4 digits for
              verification purposes.
            </p>
            <p>
              📊 Full tax information is only accessible through secure backend procedures for IRS
              1099 reporting.
            </p>
            <p>
              🔐 All admin actions are logged for audit and compliance purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
