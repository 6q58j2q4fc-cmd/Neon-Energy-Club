#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const clientSrc = path.join(projectRoot, 'client/src');

// Pattern: trpc query result accessed without .data
// Example: const result = trpc.something.useQuery(); result.locations
// Fix: result.data?.locations

function fixTRPCDataAccess(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Pattern 1: Direct property access on tRPC query result
  // Look for: variableName.propertyName where variableName is a tRPC query result
  // This is complex because we need to track variable assignments

  // Simpler approach: Find all tRPC useQuery calls and track their variable names
  const queryResultVars: string[] = [];
  
  // Match: const varName = trpc.*.useQuery(...)
  const queryPattern = /const\s+(\w+)\s*=\s*trpc\.\w+\.\w+\.useQuery\(/g;
  let match;
  while ((match = queryPattern.exec(content)) !== null) {
    queryResultVars.push(match[1]);
  }

  // Now find all property accesses on these variables
  for (const varName of queryResultVars) {
    // Pattern: varName.propertyName (but NOT varName.data, varName.isLoading, varName.error, varName.refetch)
    const validProps = ['data', 'isLoading', 'error', 'refetch', 'isError', 'isFetching', 'isSuccess', 'status'];
    
    // Find all property accesses
    const accessPattern = new RegExp(`\\b${varName}\\.(\\w+)`, 'g');
    const replacements: Array<{ from: string; to: string }> = [];
    
    let accessMatch;
    while ((accessMatch = accessPattern.exec(content)) !== null) {
      const prop = accessMatch[1];
      if (!validProps.includes(prop)) {
        // This is likely a data property being accessed directly
        const fullMatch = accessMatch[0]; // e.g., "result.locations"
        const replacement = `${varName}.data?.${prop}`;
        replacements.push({ from: fullMatch, to: replacement });
      }
    }

    // Apply replacements
    for (const { from, to } of replacements) {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const newContent = content.replace(regex, to);
      if (newContent !== content) {
        content = newContent;
        fixCount++;
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return fixCount;
  }

  return 0;
}

function processDirectory(dir: string): number {
  let totalFixes = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      totalFixes += processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const fixes = fixTRPCDataAccess(fullPath);
      if (fixes > 0) {
        console.log(`✅ Fixed ${fixes} tRPC data access patterns in ${path.relative(projectRoot, fullPath)}`);
        totalFixes += fixes;
      }
    }
  }

  return totalFixes;
}

console.log('🔍 Scanning for tRPC data access pattern errors...\n');
const totalFixes = processDirectory(clientSrc);
console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('\n📊 Run `pnpm exec tsc --noEmit` to verify error count reduction.');
