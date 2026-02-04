import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Database, Download, Upload, Clock, Shield, AlertTriangle, 
  CheckCircle, XCircle, RefreshCw, Trash2, Eye, Calendar,
  FileArchive, History, Settings
} from "lucide-react";
import { format } from "date-fns";

export function AdminBackupRestore() {
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState<"full" | "incremental" | "table_specific" | "manual">("manual");
  const [retentionDays, setRetentionDays] = useState(30);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [auditCategory, setAuditCategory] = useState<"all" | "user" | "distributor" | "order" | "commission" | "website" | "backup" | "restore" | "admin" | "security" | "system">("all");
  const [auditSeverity, setAuditSeverity] = useState<"all" | "info" | "warning" | "error" | "critical">("all");

  const { data: backupsData, refetch: refetchBackups } = trpc.admin.getBackups.useQuery({ page: 1, limit: 20 });
  const { data: deletedRecords, refetch: refetchDeleted } = trpc.admin.getDeletedRecords.useQuery({ page: 1, limit: 20 });
  const { data: auditLog, refetch: refetchAudit } = trpc.admin.getAuditLog.useQuery({ 
    page: 1, 
    limit: 50,
    category: auditCategory,
    severity: auditSeverity,
  });
  const { data: schedules, refetch: refetchSchedules } = trpc.admin.getBackupSchedules.useQuery();

  const createBackupMutation = trpc.admin.createBackup.useMutation({
    onSuccess: (data) => {
      toast.success(`Backup created successfully! ${data.totalRecords} records backed up.`);
      setBackupName("");
      refetchBackups();
      refetchAudit();
    },
    onError: (error) => {
      toast.error(`Failed to create backup: ${error.message}`);
    },
  });

  const restoreBackupMutation = trpc.admin.restoreFromBackup.useMutation({
    onSuccess: (data) => {
      toast.success(`Restored ${data.recordsRestored} records successfully!`);
      refetchAudit();
    },
    onError: (error) => {
      toast.error(`Failed to restore: ${error.message}`);
    },
  });

  const restoreDeletedMutation = trpc.admin.restoreDeletedRecord.useMutation({
    onSuccess: (data) => {
      toast.success(`Record restored from ${data.tableName}!`);
      refetchDeleted();
      refetchAudit();
    },
    onError: (error) => {
      toast.error(`Failed to restore record: ${error.message}`);
    },
  });

  const availableTables = [
    "users", "distributors", "orders", "commissions", 
    "replicated_websites", "preorders", "sales", "notifications"
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> In Progress</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "expired":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><Clock className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Critical</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast.error("Please enter a backup name");
      return;
    }
    createBackupMutation.mutate({
      name: backupName,
      backupType,
      tables: selectedTables.length > 0 ? selectedTables : undefined,
      retentionDays,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-[#c8ff00]" />
            Backup & Restore
          </h2>
          <p className="text-gray-400 mt-1">Manage system backups, restore deleted data, and view audit logs</p>
        </div>
        <Button 
          onClick={() => {
            refetchBackups();
            refetchDeleted();
            refetchAudit();
            refetchSchedules();
          }}
          variant="outline"
          className="border-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="backups" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
            <FileArchive className="w-4 h-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="deleted" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
            <Trash2 className="w-4 h-4 mr-2" />
            Deleted Records
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="schedules" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
            <Calendar className="w-4 h-4 mr-2" />
            Schedules
          </TabsTrigger>
        </TabsList>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          {/* Create Backup Card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-[#c8ff00]" />
                Create New Backup
              </CardTitle>
              <CardDescription>Create a manual backup of your system data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Backup Name</Label>
                  <Input 
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="e.g., Pre-update backup"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup Type</Label>
                  <Select value={backupType} onValueChange={(v) => setBackupType(v as any)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="incremental">Incremental</SelectItem>
                      <SelectItem value="table_specific">Table Specific</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retention (Days)</Label>
                  <Input 
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tables to Backup (leave empty for all)</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTables.map((table) => (
                    <Button
                      key={table}
                      variant={selectedTables.includes(table) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table) 
                            ? prev.filter(t => t !== table)
                            : [...prev, table]
                        );
                      }}
                      className={selectedTables.includes(table) ? "bg-[#c8ff00] text-black" : "border-gray-700"}
                    >
                      {table}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateBackup}
                disabled={createBackupMutation.isPending}
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33]"
              >
                {createBackupMutation.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Create Backup</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Backups List */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Backup History</CardTitle>
              <CardDescription>View and restore from previous backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backupsData?.backups && backupsData.backups.length > 0 ? (
                  backupsData.backups.map((backup) => (
                    <div 
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{backup.name}</span>
                          {getStatusBadge(backup.status)}
                          <Badge variant="outline" className="text-xs">{backup.backupType}</Badge>
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-4">
                          <span>{backup.totalRecords} records</span>
                          <span>•</span>
                          <span>{format(new Date(backup.createdAt), "MMM d, yyyy h:mm a")}</span>
                          {backup.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires: {format(new Date(backup.expiresAt), "MMM d, yyyy")}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700"
                          onClick={() => {
                            restoreBackupMutation.mutate({
                              backupId: backup.id,
                              restorationType: "full",
                            });
                          }}
                          disabled={backup.status !== "completed" || restoreBackupMutation.isPending}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No backups found. Create your first backup above.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deleted Records Tab */}
        <TabsContent value="deleted" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Deleted Records Archive
              </CardTitle>
              <CardDescription>Restore accidentally deleted data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deletedRecords?.records && deletedRecords.records.length > 0 ? (
                  deletedRecords.records.map((record) => (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{record.tableName}</Badge>
                          <span className="text-white">ID: {record.originalId}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Deleted: {format(new Date(record.deletedAt), "MMM d, yyyy h:mm a")}
                          {record.deletionReason && <span> • {record.deletionReason}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => restoreDeletedMutation.mutate({ archiveId: record.id })}
                          disabled={restoreDeletedMutation.isPending}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No deleted records in archive.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-[#c8ff00]" />
                    System Audit Log
                  </CardTitle>
                  <CardDescription>Track all system actions and changes</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={auditCategory} onValueChange={(v) => setAuditCategory(v as any)}>
                    <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="backup">Backup</SelectItem>
                      <SelectItem value="restore">Restore</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={auditSeverity} onValueChange={(v) => setAuditSeverity(v as any)}>
                    <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLog?.entries && auditLog.entries.length > 0 ? (
                  auditLog.entries.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(entry.severity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                            <span className="text-white text-sm">{entry.action}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {entry.entityType} #{entry.entityId} • {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.result === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : entry.result === "failure" ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audit log entries found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c8ff00]" />
                Backup Schedules
              </CardTitle>
              <CardDescription>Configure automated backup schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules && schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <div 
                      key={schedule.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{schedule.name}</span>
                          <Badge className={schedule.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {schedule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {schedule.cronExpression} • {schedule.backupType} • Retention: {schedule.retentionDays} days
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-700">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No backup schedules configured.</p>
                    <Button className="mt-4 bg-[#c8ff00] text-black hover:bg-[#d4ff33]">
                      Create Schedule
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminBackupRestore;
