#!/bin/bash
# Re-apply all 11 Phase 13 verified fixes

cd /home/ubuntu/neon-energy-preorder

# Fix 1: replicatedWebsiteSystem.ts line 166
sed -i '166s/if (!db) return \[\];/if (!db) return {\n    siteId: distributorId,\n    distributorCode: "unknown",\n    status: "error",\n    issues: [{ type: "data_drift", severity: "critical", description: "Database unavailable", autoFixed: 0 }],\n    lastAuditedAt: new Date().toISOString(),\n  };/' server/replicatedWebsiteSystem.ts

# Fix 2: replicatedWebsiteSystem.ts line 321
sed -i '321s/if (!db) return \[\];/if (!db) return {\n    timestamp: new Date().toISOString(),\n    sitesAudited: 0,\n    issuesFound: 0,\n    issuesFixed: 0,\n    criticalIssues: 0,\n    details: [],\n  };/' server/replicatedWebsiteSystem.ts

# Fix 3: replicatedWebsiteSystem.ts line 461
sed -i '461s/if (!db) return \[\];/if (!db) return { success: false, steps: [{ step: "Database Connection", status: "fail", details: "Database unavailable" }] };/' server/replicatedWebsiteSystem.ts

# Fix 4: mlmDataMonitor.ts line 230
sed -i '230s/if (!db) return \[\];/if (!db) return {\n    timestamp: new Date().toISOString(),\n    checksPerformed: 0,\n    issuesFound: 0,\n    issuesFixed: 0,\n    details: [],\n  };/' server/mlmDataMonitor.ts

# Fix 5: teamPerformanceAlerts.ts line 318
sed -i '318s/return null;/return [];/' server/teamPerformanceAlerts.ts

# Fix 6-8: milestoneNotifications.ts lines 191, 206, 172
sed -i '191s/if (!db) return ;/\/\/ if (!db) return ;/' server/milestoneNotifications.ts
sed -i '206s/if (!db) return ;/\/\/ if (!db) return ;/' server/milestoneNotifications.ts
sed -i '172s/if (!db) return ;/\/\/ if (!db) return ;/' server/milestoneNotifications.ts

# Fix 9-10: mlmDataMonitor.ts lines 335, 350
sed -i '335s/issue.autoFixed = true;/issue.autoFixed = 1;/' server/mlmDataMonitor.ts
sed -i '350s/issue.autoFixed = true;/issue.autoFixed = 1;/' server/mlmDataMonitor.ts

echo "All 11 Phase 13 fixes re-applied"
