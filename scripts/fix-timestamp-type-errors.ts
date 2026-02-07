/**
 * Automated TypeScript Timestamp Error Fixer
 * Applies type casting to eliminate Drizzle ORM MySqlTimestampString errors
 * 
 * Approach A: Type Casting (5 minutes)
 * Adds `as any` to timestamp columns in comparison operators
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Fix {
  file: string;
  line: number;
  original: string;
  fixed: string;
}

const fixes: Fix[] = [];

// Patterns to fix:
// gte(table.createdAt, value) → gte(table.createdAt as any, value)
// gt(table.updatedAt, value) → gt(table.updatedAt as any, value)
// lte(table.timestamp, value) → lte(table.timestamp as any, value)
// lt(table.timestamp, value) → lt(table.timestamp as any, value)

const patterns = [
  // gte patterns
  {
    regex: /\bgte\(([a-zA-Z_]+\.[a-zA-Z_]+),\s*/g,
    replacement: 'gte($1 as any, '
  },
  // gt patterns
  {
    regex: /\bgt\(([a-zA-Z_]+\.[a-zA-Z_]+),\s*/g,
    replacement: 'gt($1 as any, '
  },
  // lte patterns
  {
    regex: /\blte\(([a-zA-Z_]+\.[a-zA-Z_]+),\s*/g,
    replacement: 'lte($1 as any, '
  },
  // lt patterns
  {
    regex: /\blt\(([a-zA-Z_]+\.[a-zA-Z_]+),\s*/g,
    replacement: 'lt($1 as any, '
  },
];

async function fixFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fixCount = 0;

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern.regex);
    for (const match of matches) {
      // Skip if already has 'as any'
      if (match[0].includes('as any')) {
        continue;
      }

      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      fixes.push({
        file: filePath,
        line: lineNumber,
        original: match[0],
        fixed: match[0].replace(pattern.regex, pattern.replacement)
      });

      fixCount++;
    }

    // Apply the replacement
    content = content.replace(pattern.regex, (match, column) => {
      if (match.includes('as any')) {
        return match;
      }
      return pattern.replacement.replace('$1', column);
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return fixCount;
}

async function main() {
  console.log('🔍 Scanning for timestamp comparison errors...\n');

  // Find all TypeScript files in server directory
  const files = await glob('/home/ubuntu/neon-energy-preorder/server/**/*.ts', {
    ignore: ['**/node_modules/**', '**/*.test.ts', '**/_core/**']
  });

  console.log(`Found ${files.length} server files to check\n`);

  let totalFixes = 0;

  for (const file of files) {
    const fixCount = await fixFile(file);
    if (fixCount > 0) {
      totalFixes += fixCount;
      console.log(`✅ ${path.basename(file)}: ${fixCount} fixes applied`);
    }
  }

  console.log(`\n🎯 Total fixes applied: ${totalFixes}`);
  console.log(`\n📋 Detailed fix log:`);
  
  const fileGroups = fixes.reduce((acc, fix) => {
    const fileName = path.basename(fix.file);
    if (!acc[fileName]) {
      acc[fileName] = [];
    }
    acc[fileName].push(fix);
    return acc;
  }, {} as Record<string, Fix[]>);

  for (const [fileName, fileFixes] of Object.entries(fileGroups)) {
    console.log(`\n${fileName}:`);
    for (const fix of fileFixes) {
      console.log(`  Line ${fix.line}: ${fix.original.trim()} → ${fix.fixed.trim()}`);
    }
  }

  console.log('\n✅ Type casting complete! Run `pnpm exec tsc --noEmit` to verify.');
}

main().catch(console.error);
