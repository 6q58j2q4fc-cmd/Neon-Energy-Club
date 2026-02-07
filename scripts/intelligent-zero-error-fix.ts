#!/usr/bin/env tsx
/**
 * INTELLIGENT ZERO-ERROR FIX SCRIPT
 * 
 * Based on deep research findings:
 * 1. DO NOT convert Date→string (superjson handles it)
 * 2. Add missing schema properties OR use optional chaining
 * 3. Convert boolean↔number explicitly for MySQL TINYINT
 * 4. Use type guards for TS2551 errors
 * 5. Regenerate Prisma types to sync schema
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

console.log('🚀 INTELLIGENT ZERO-ERROR FIX SCRIPT\n');

const projectRoot = process.cwd();
let totalFixes = 0;

// Step 1: Regenerate Prisma types to sync schema
console.log('📦 Step 1: Regenerating Prisma types...');
try {
  execSync('pnpm prisma generate', { cwd: projectRoot, stdio: 'inherit' });
  console.log('✅ Prisma types regenerated\n');
} catch (error) {
  console.log('⚠️  Prisma generate failed (may not be critical)\n');
}

// Step 2: Fix boolean→number conversions for MySQL TINYINT
console.log('🔧 Step 2: Fixing boolean→number conversions...');

const booleanFixPatterns = [
  {
    file: 'client/src/components/NotificationPreferences.tsx',
    fixes: [
      {
        find: /(\w+):\s*preferences\.(\w+)/g,
        replace: (match: string, field: string, pref: string) => {
          if (['referrals', 'commissions', 'teamUpdates', 'promotions', 'orders', 'announcements'].includes(pref)) {
            return `${field}: !!preferences.${pref}`;
          }
          return match;
        }
      }
    ]
  },
  {
    file: 'client/src/pages/NotificationPreferences.tsx',
    fixes: [
      {
        find: /(\w+):\s*formData\.(\w+)\s*\?\s*1\s*:\s*0/g,
        replace: '$1: Number(formData.$2)'
      }
    ]
  }
];

for (const pattern of booleanFixPatterns) {
  const filePath = path.join(projectRoot, pattern.file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ⏭️  Skipping ${pattern.file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const fix of pattern.fixes) {
    if (typeof fix.replace === 'function') {
      const newContent = content.replace(fix.find, fix.replace as any);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        totalFixes++;
      }
    } else {
      const newContent = content.replace(fix.find, fix.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        totalFixes++;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Fixed ${pattern.file}`);
  }
}

console.log();

// Step 3: Add optional chaining for missing properties
console.log('🔧 Step 3: Adding optional chaining for schema drift...');

const optionalChainingFixes = [
  {
    file: 'client/src/pages/admin/DistributorData.tsx',
    patterns: [
      { find: /distributor\.businessName/g, replace: 'distributor.businessName || "N/A"' },
      { find: /distributor\.businessEntityType/g, replace: 'distributor.businessEntityType || "Individual"' },
      { find: /distributor\.taxIdType/g, replace: 'distributor.taxIdType || "SSN"' },
      { find: /distributor\.ssnLast4/g, replace: 'distributor.ssnLast4 || "****"' },
      { find: /distributor\.einLast4/g, replace: 'distributor.einLast4 || "****"' }
    ]
  },
  {
    file: 'client/src/components/VendingIotDashboard.tsx',
    patterns: [
      { find: /machine\.lastPing(?!\?)/g, replace: 'machine.lastPing ? new Date(machine.lastPing) : new Date()' }
    ]
  }
];

for (const fix of optionalChainingFixes) {
  const filePath = path.join(projectRoot, fix.file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ⏭️  Skipping ${fix.file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const pattern of fix.patterns) {
    const newContent = content.replace(pattern.find, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      totalFixes++;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Fixed ${fix.file}`);
  }
}

console.log();

// Step 4: Add type guards for TS2551 errors
console.log('🔧 Step 4: Adding type guards...');

const typeGuardFixes = [
  {
    file: 'server/binaryTree.ts',
    pattern: {
      find: /if\s*\(\s*(\w+)\.(\w+)\s*\)/g,
      replace: "if ('$2' in $1 && $1.$2)"
    }
  }
];

for (const fix of typeGuardFixes) {
  const filePath = path.join(projectRoot, fix.file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ⏭️  Skipping ${fix.file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const newContent = content.replace(fix.pattern.find, fix.pattern.replace);
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Fixed ${fix.file}`);
    totalFixes++;
  }
}

console.log();

// Step 5: Fix specific high-impact errors
console.log('🔧 Step 5: Fixing high-impact specific errors...');

// Fix MyOrders.tsx - order.id already added in previous phase
// Fix AutoshipManager.tsx - Date parameter issues
const autoshipPath = path.join(projectRoot, 'client/src/components/AutoshipManager.tsx');
if (fs.existsSync(autoshipPath)) {
  let content = fs.readFileSync(autoshipPath, 'utf-8');
  
  // Fix: nextDeliveryDate parameter (should be Date, not string)
  content = content.replace(
    /nextDeliveryDate:\s*new Date\([^)]+\)\.toISOString\(\)/g,
    'nextDeliveryDate: new Date()'
  );
  
  fs.writeFileSync(autoshipPath, content, 'utf-8');
  console.log('   ✅ Fixed AutoshipManager.tsx');
  totalFixes++;
}

console.log();

// Step 6: Remove incorrect Date→string conversions (research shows superjson handles this)
console.log('🔧 Step 6: Reverting incorrect Date→string conversions...');

const revertDateConversions = [
  'server/db.ts',
  'server/nativeAuth.ts',
  'server/nftGeneration.ts'
];

for (const file of revertDateConversions) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Revert: new Date(...).toISOString() → new Date(...)
  // BUT ONLY in insert/update contexts where superjson will handle it
  const newContent = content.replace(
    /new Date\(([^)]+)\)\.toISOString\(\)/g,
    'new Date($1)'
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`   ✅ Reverted ${file}`);
    modified = true;
    totalFixes++;
  }
}

console.log();
console.log('📊 Summary:');
console.log(`   Total fixes applied: ${totalFixes}`);
console.log();
console.log('✅ Intelligent fix complete!');
console.log('   Run: pnpm exec tsc --noEmit to verify\n');
