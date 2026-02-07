import * as fs from 'fs';
import { glob } from 'glob';

async function fixFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixes = 0;

  // Pattern 1: timestamp: new Date() → timestamp: new Date().toISOString()
  const pattern1 = /(\w+):\s*new Date\(([^)]*)\)/g;
  const matches1 = content.match(pattern1);
  
  if (matches1) {
    content = content.replace(pattern1, (match, prop, args) => {
      fixes++;
      return args 
        ? `${prop}: new Date(${args}).toISOString()`
        : `${prop}: new Date().toISOString()`;
    });
  }

  // Pattern 2: createdAt: new Date(), updatedAt: new Date() → ISO strings
  const pattern2 = /(createdAt|updatedAt|timestamp|date):\s*new Date\(\)/g;
  const matches2 = content.match(pattern2);
  
  if (matches2) {
    content = content.replace(pattern2, (match, prop) => {
      fixes++;
      return `${prop}: new Date().toISOString()`;
    });
  }

  if (fixes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return fixes;
}

async function main() {
  const files = await glob('client/src/**/*.{ts,tsx}', { 
    absolute: true,
    cwd: '/home/ubuntu/neon-energy-preorder'
  });
  
  let total = 0;
  const fixedFiles: string[] = [];

  for (const file of files) {
    const fixed = await fixFile(file);
    if (fixed > 0) {
      const relativePath = file.replace('/home/ubuntu/neon-energy-preorder/', '');
      console.log(`✅ ${relativePath}: ${fixed} fixes`);
      fixedFiles.push(relativePath);
      total += fixed;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${files.length}`);
  console.log(`   Files with fixes: ${fixedFiles.length}`);
  console.log(`   Total timestamp fixes: ${total}`);
  
  if (fixedFiles.length > 0) {
    console.log(`\n📁 Fixed files:`);
    fixedFiles.forEach(f => console.log(`   - ${f}`));
  }
}

main().catch(console.error);
