#!/usr/bin/env tsx
/**
 * Phase 12: Elite Hacker Reconnaissance Script
 * Analyzes all 97 TypeScript errors and categorizes by type, file, and impact level
 */

import * as fs from 'fs';
import * as path from 'path';

interface ErrorEntry {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

interface ErrorStats {
  byCode: Record<string, number>;
  byFile: Record<string, number>;
  highImpactFiles: Array<{ file: string; count: number }>;
  total: number;
}

function parseTypeScriptErrors(errorText: string): ErrorEntry[] {
  const errors: ErrorEntry[] = [];
  const lines = errorText.split('\n');
  
  for (const line of lines) {
    // Match pattern: file.ts(line,col): error TSxxxx: message
    const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (match) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
  }
  
  return errors;
}

function analyzeErrors(errors: ErrorEntry[]): ErrorStats {
  const stats: ErrorStats = {
    byCode: {},
    byFile: {},
    highImpactFiles: [],
    total: errors.length
  };
  
  // Count by error code
  for (const error of errors) {
    stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
    stats.byFile[error.file] = (stats.byFile[error.file] || 0) + 1;
  }
  
  // Sort files by error count
  stats.highImpactFiles = Object.entries(stats.byFile)
    .map(([file, count]) => ({ file, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return stats;
}

function generateReport(stats: ErrorStats): string {
  let report = '# TypeScript Error Analysis Report\n\n';
  report += `## Total Errors: ${stats.total}\n\n`;
  
  report += '## Errors by Type\n\n';
  const sortedCodes = Object.entries(stats.byCode)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [code, count] of sortedCodes) {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    report += `- **${code}**: ${count} errors (${percentage}%)\n`;
  }
  
  report += '\n## Top 10 High-Impact Files\n\n';
  for (const { file, count } of stats.highImpactFiles) {
    const shortFile = file.replace('/home/ubuntu/neon-energy-preorder/', '');
    report += `- **${shortFile}**: ${count} errors\n`;
  }
  
  report += '\n## Error Code Descriptions\n\n';
  report += '- **TS2339**: Property does not exist on type (schema drift)\n';
  report += '- **TS2322**: Type X is not assignable to type Y (type mismatch)\n';
  report += '- **TS2345**: Argument type mismatch\n';
  report += '- **TS2551**: Property may not exist (optional property access)\n';
  report += '- **TS2740**: Type missing required properties\n';
  
  return report;
}

async function main() {
  try {
    // Read error output
    const errorText = fs.readFileSync('/tmp/ts-errors-phase12.txt', 'utf-8');
    
    // Parse errors
    const errors = parseTypeScriptErrors(errorText);
    console.log(`✅ Parsed ${errors.length} TypeScript errors`);
    
    // Analyze
    const stats = analyzeErrors(errors);
    
    // Generate report
    const report = generateReport(stats);
    
    // Save report
    const reportPath = '/home/ubuntu/neon-energy-preorder/TS_ERROR_ANALYSIS.md';
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Report saved to ${reportPath}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`Total errors: ${stats.total}`);
    console.log(`\nTop 3 error types:`);
    Object.entries(stats.byCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count} errors`);
      });
    
    console.log(`\nTop 5 files:`);
    stats.highImpactFiles.slice(0, 5).forEach(({ file, count }) => {
      const shortFile = file.replace('/home/ubuntu/neon-energy-preorder/', '');
      console.log(`  ${shortFile}: ${count} errors`);
    });
    
  } catch (error) {
    console.error('❌ Error analyzing TypeScript errors:', error);
    process.exit(1);
  }
}

main();
