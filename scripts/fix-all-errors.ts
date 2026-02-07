#!/usr/bin/env tsx
/**
 * Comprehensive TypeScript Error Fix Script
 * Fixes all remaining type errors systematically
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Pattern 1: Add db null guards after "const db = await getDb();"
function addDbNullGuards(content: string, returnValue: string): string {
  const pattern = /const db = await getDb\(\);(?!\s*if\s*\(!db\))/g;
  return content.replace(pattern, `const db = await getDb();\n  if (!db) return ${returnValue};`);
}

// Pattern 2: Fix boolean to number for MySQL tinyint
function fixBooleanToNumber(content: string): string {
  // Fix in update statements
  content = content.replace(
    /(\w+):\s*preferences\.(\w+)/g,
    (match, field, prop) => {
      if (['referrals', 'commissions', 'teamUpdates', 'promotions', 'orders', 'announcements'].includes(prop)) {
        return `${field}: preferences.${prop} !== undefined ? (preferences.${prop} ? 1 : 0) : undefined`;
      }
      return match;
    }
  );
  
  // Fix in insert statements with ?? true
  content = content.replace(
    /(\w+):\s*preferences\.(\w+)\s*\?\?\s*true/g,
    (match, field, prop) => {
      if (['referrals', 'commissions', 'teamUpdates', 'promotions', 'orders', 'announcements'].includes(prop)) {
        return `${field}: preferences.${prop} !== undefined ? (preferences.${prop} ? 1 : 0) : 1`;
      }
      return match;
    }
  );
  
  return content;
}

// Pattern 3: Fix Date to string conversions
function fixDateToString(content: string): string {
  // Fix: new Date(Date.now() + ...) → new Date(Date.now() + ...).toISOString()
  content = content.replace(
    /const\s+(\w+)\s*=\s*new Date\(Date\.now\(\)\s*\+\s*[^)]+\);(?!\s*\.toISOString)/g,
    (match, varName) => match.replace(');', ').toISOString();')
  );
  
  // Fix: timestamp: new Date() → timestamp: new Date().toISOString()
  content = content.replace(
    /(timestamp|createdAt|updatedAt|expiresAt|lastPing):\s*new Date\(\)(?!\.toISOString)/g,
    '$1: new Date().toISOString()'
  );
  
  // Fix: .toLocaleTimeString() on string → new Date(...).toLocaleTimeString()
  content = content.replace(
    /(\w+)\.timestamp\.toLocaleTimeString\(/g,
    'new Date($1.timestamp).toLocaleTimeString('
  );
  
  // Fix: .toLocaleDateString() on string → new Date(...).toLocaleDateString()
  content = content.replace(
    /(\w+)\.(\w+)\.toLocaleDateString\(/g,
    'new Date($1.$2).toLocaleDateString('
  );
  
  return content;
}

// Pattern 4: Fix string.toISOString() → new Date(string).toISOString()
function fixStringToISOString(content: string): string {
  // Fix: date.toISOString() where date is string parameter
  content = content.replace(
    /const\s+format\w+Date\s*=\s*\(date:\s*string\)\s*=>\s*\{\s*return\s+date\.toISOString\(/g,
    (match) => match.replace('date.toISOString(', 'new Date(date).toISOString(')
  );
  
  return content;
}

// Pattern 5: Fix string < Date comparisons
function fixDateComparisons(content: string): string {
  content = content.replace(
    /return\s+date\s+<\s+today;/g,
    'return new Date(date) < today;'
  );
  
  return content;
}

async function fixFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Determine appropriate return value based on file type
  let returnValue = '[]';
  if (filePath.includes('binaryTree.ts')) {
    if (content.includes('Promise<TreePosition | null>')) returnValue = 'null';
    if (content.includes('Promise<LegVolumes>')) returnValue = '{ leftLegVolume: 0, rightLegVolume: 0 }';
    if (content.includes('Promise<PlacementResult>')) returnValue = '{ parentId: 0, position: "left" as PlacementPosition, depthLevel: 0 }';
  } else if (filePath.includes('charityImpact.ts')) {
    if (content.includes('totalImpact:')) returnValue = '{ totalImpact: 0, milestones: [] }';
    if (content.includes('leaderboard:')) returnValue = '{ totalImpact: 0, leaderboard: [] }';
    if (content.includes('Promise<void>')) returnValue = '';
  } else if (filePath.includes('milestoneNotifications.ts')) {
    returnValue = '';
  }
  
  // Apply all fix patterns
  content = addDbNullGuards(content, returnValue);
  content = fixBooleanToNumber(content);
  content = fixDateToString(content);
  content = fixStringToISOString(content);
  content = fixDateComparisons(content);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return 1;
  }
  
  return 0;
}

async function main() {
  console.log('🔧 Starting comprehensive TypeScript error fixes...\n');
  
  const serverFiles = await glob(`${projectRoot}/server/**/*.ts`, {
    ignore: ['**/node_modules/**', '**/_core/**']
  });
  
  const clientFiles = await glob(`${projectRoot}/client/src/**/*.tsx`, {
    ignore: ['**/node_modules/**']
  });
  
  let fixedCount = 0;
  
  console.log(`📁 Processing ${serverFiles.length} server files...`);
  for (const file of serverFiles) {
    fixedCount += await fixFile(file);
  }
  
  console.log(`📁 Processing ${clientFiles.length} client files...`);
  for (const file of clientFiles) {
    fixedCount += await fixFile(file);
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
}

main().catch(console.error);
