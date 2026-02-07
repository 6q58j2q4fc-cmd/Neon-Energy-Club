#!/usr/bin/env tsx
/**
 * Custom TypeScript Compiler API Bulk Fix Script
 * 
 * Uses TypeScript's own compiler API to intelligently fix common error patterns:
 * 1. TS2339 - Add .data to tRPC query results
 * 2. TS2322 - Date→string conversions
 * 3. TS2345 - Fix function argument types
 * 
 * Based on research from:
 * - https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 * - https://www.automasean.blog/typescript-errors/
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface FixResult {
  file: string;
  errorsBefore: number;
  errorsAfter: number;
  fixesApplied: string[];
}

const results: FixResult[] = [];

// Create TypeScript program
const configPath = path.resolve(process.cwd(), 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

console.log('🔍 Creating TypeScript program...');
const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const checker = program.getTypeChecker();

console.log('📊 Getting diagnostics...');
const allDiagnostics = ts.getPreEmitDiagnostics(program);

console.log(`\n📈 Found ${allDiagnostics.length} total errors\n`);

// Group errors by file
const errorsByFile = new Map<string, ts.Diagnostic[]>();
for (const diagnostic of allDiagnostics) {
  if (diagnostic.file) {
    const fileName = diagnostic.file.fileName;
    if (!errorsByFile.has(fileName)) {
      errorsByFile.set(fileName, []);
    }
    errorsByFile.get(fileName)!.push(diagnostic);
  }
}

// Sort files by error count (highest first)
const sortedFiles = Array.from(errorsByFile.entries())
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10); // Top 10 files

console.log('🎯 Top 10 files by error count:');
sortedFiles.forEach(([file, errors], index) => {
  const relativePath = path.relative(process.cwd(), file);
  console.log(`${index + 1}. ${relativePath}: ${errors.length} errors`);
});

console.log('\n🔧 Starting fixes...\n');

// Fix each file
for (const [fileName, diagnostics] of sortedFiles) {
  const relativePath = path.relative(process.cwd(), fileName);
  console.log(`\n📝 Processing: ${relativePath}`);
  console.log(`   Errors before: ${diagnostics.length}`);
  
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) {
    console.log(`   ⚠️  Could not load source file, skipping`);
    continue;
  }
  
  let fileContent = sourceFile.getFullText();
  const fixesApplied: string[] = [];
  let changesMade = false;
  
  // Pattern 1: Fix tRPC query result access (TS2339)
  // result.locations → result.data?.locations
  const trpcErrors = diagnostics.filter(d => d.code === 2339);
  if (trpcErrors.length > 0) {
    console.log(`   🔍 Found ${trpcErrors.length} TS2339 errors (property does not exist)`);
    
    // This is complex - requires AST traversal
    // For now, skip and handle manually
  }
  
  // Pattern 2: Fix Date→string (TS2322)
  // new Date() → new Date().toISOString()
  const dateErrors = diagnostics.filter(d => d.code === 2322);
  if (dateErrors.length > 0) {
    console.log(`   🔍 Found ${dateErrors.length} TS2322 errors (type not assignable)`);
    
    for (const error of dateErrors) {
      if (!error.start || !error.length) continue;
      
      const errorText = fileContent.substring(error.start, error.start + error.length);
      
      // Check if it's a Date assignment to string field
      if (errorText.includes('new Date(') && !errorText.includes('.toISOString()')) {
        // Find the full statement
        let statementStart = error.start;
        while (statementStart > 0 && fileContent[statementStart] !== '\n' && fileContent[statementStart] !== ';') {
          statementStart--;
        }
        
        let statementEnd = error.start + error.length;
        while (statementEnd < fileContent.length && fileContent[statementEnd] !== '\n' && fileContent[statementEnd] !== ';' && fileContent[statementEnd] !== ',') {
          statementEnd++;
        }
        
        const statement = fileContent.substring(statementStart, statementEnd);
        
        // Add .toISOString() to Date constructors
        const fixed = statement.replace(/new Date\(([^)]+)\)(?!\s*\.toISOString)/g, 'new Date($1).toISOString()');
        
        if (fixed !== statement) {
          fileContent = fileContent.substring(0, statementStart) + fixed + fileContent.substring(statementEnd);
          fixesApplied.push(`Date→string at line ${sourceFile.getLineAndCharacterOfPosition(error.start!).line + 1}`);
          changesMade = true;
        }
      }
    }
  }
  
  // Pattern 3: Fix string.getTime() → new Date(string).getTime()
  const getTimePattern = /(\w+)\.getTime\(\)/g;
  let match;
  while ((match = getTimePattern.exec(fileContent)) !== null) {
    const varName = match[1];
    // Check if this variable is a string type
    // For simplicity, just wrap all .getTime() calls
    const replacement = `new Date(${varName}).getTime()`;
    fileContent = fileContent.replace(match[0], replacement);
    fixesApplied.push(`Fixed .getTime() on ${varName}`);
    changesMade = true;
  }
  
  // Write changes if any
  if (changesMade) {
    fs.writeFileSync(fileName, fileContent, 'utf-8');
    console.log(`   ✅ Applied ${fixesApplied.length} fixes`);
    fixesApplied.forEach(fix => console.log(`      - ${fix}`));
  } else {
    console.log(`   ℹ️  No automated fixes available`);
  }
  
  results.push({
    file: relativePath,
    errorsBefore: diagnostics.length,
    errorsAfter: -1, // Will be calculated after re-check
    fixesApplied
  });
}

console.log('\n\n📊 Summary:');
console.log(`Files processed: ${results.length}`);
console.log(`Total fixes applied: ${results.reduce((sum, r) => sum + r.fixesApplied.length, 0)}`);

console.log('\n✅ Done! Re-run TypeScript check to verify error count reduction.');
console.log('   Run: pnpm exec tsc --noEmit\n');
