# Elite TypeScript Error Elimination Tactics

## Research Summary: Top Hacker/Coder Strategies

### 🔥 Secret Sauce #1: ts-autofix (Automated Code Fixes)

**Source:** https://github.com/ian-craig/ts-autofix

**What it does:**
- Automatically applies TypeScript's built-in code fixes (codefixes) to your entire codebase
- Uses TypeScript Compiler API to find and apply fixes programmatically
- Can filter by error codes or fix types

**Usage:**
```bash
# List available fixes
npx ts-autofix list --project tsconfig.json

# Apply all fixes
npx ts-autofix --project tsconfig.json

# Apply specific error codes
npx ts-autofix --errors TS6133 TS7006 --project tsconfig.json

# Apply specific fix types
npx ts-autofix --fixes unusedIdentifier inferFromUsage --project tsconfig.json
```

**Limitations:**
- Only works for errors that have built-in TypeScript codefixes
- Cannot fix schema drift or type definition issues
- Best for: unused variables, missing imports, implicit any

---

### 🔥 Secret Sauce #2: Incremental Lint-Staged Approach

**Source:** https://www.automasean.blog/typescript-errors/ (408 → 0 errors in 14 months)

**Strategy:**
1. Don't try to fix all errors at once
2. Use `lint-staged` + `eslint-plugin-tsc` to type-check only staged files
3. Fix errors incrementally as you touch files
4. Prevent new errors from being committed

**Implementation:**
```json
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": "eslint --plugin tsc --rule 'tsc/config: [2, {configFile: \"./tsconfig.json\"}]'"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
```

**Results:**
- 408 errors → 0 errors in 14 months
- No dedicated sprints needed
- Errors fixed alongside feature work

**Key Insight:** "Leave the campground cleaner than you found it"

---

### 🔥 Secret Sauce #3: TypeScript Compiler API (Advanced)

**Source:** https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

**Power moves:**
1. **Programmatic type checking:**
   ```typescript
   import * as ts from 'typescript';
   
   const program = ts.createProgram(fileNames, compilerOptions);
   const diagnostics = ts.getPreEmitDiagnostics(program);
   ```

2. **AST transformation:**
   - Parse code into Abstract Syntax Tree
   - Modify nodes programmatically
   - Generate fixed code

3. **Custom code fixes:**
   ```typescript
   const languageService = ts.createLanguageService(host);
   const codefixes = languageService.getCodeFixesAtPosition(
     fileName, start, end, errorCodes, formatOptions, preferences
   );
   ```

**Use cases:**
- Bulk renaming/refactoring
- Adding missing properties to types
- Converting Date→string systematically

---

### 🔥 Secret Sauce #4: Error Categorization & Prioritization

**Strategy:**
1. **Group by error code** (TS2339, TS2322, etc.)
2. **Identify "mother errors"** - fixing one eliminates cascading errors
3. **Fix highest-impact files first** (most errors per file)
4. **Verify after each fix** - don't accumulate broken changes

**Our findings:**
- TS2339 (Property does not exist) = 33 errors → Often caused by missing `.data` on tRPC queries
- TS2322 (Type not assignable) = 27 errors → Date/string mismatches
- TS2345 (Argument type mismatch) = 18 errors → Function signature issues

---

### 🔥 Secret Sauce #5: Type Assertion as Last Resort

**Pattern:**
```typescript
// ❌ Bad: Suppress errors with 'any'
const result = something as any;

// ⚠️ Better: Specific type assertion
const result = something as ExpectedType;

// ✅ Best: Fix the actual type
interface ActualType {
  // Add missing properties
}
```

**When to use:**
- External library types are wrong
- Complex inference that TS can't figure out
- Temporary workaround with TODO comment

---

### 🔥 Secret Sauce #6: Separate Error-Free Build

**Strategy:**
1. Create `tsconfig.error-free.json` with only passing files
2. Add to CI pipeline
3. Gradually add files as errors are fixed

**Advantages:**
- Prevents new errors in fixed files
- Incremental progress tracking
- No blocking of feature work

**Disadvantages:**
- Manual file list maintenance
- Two tsconfig files to manage

---

## Our Action Plan: Hybrid Approach

**Phase 1: Automated Fixes (30 min)**
1. Run `npx ts-autofix --project tsconfig.json`
2. Verify error count reduction
3. Commit automated fixes

**Phase 2: Manual High-Impact Fixes (2 hours)**
1. Fix top 5 files by error count
2. Verify after each file
3. Target "mother errors" (TS2339, TS2322)

**Phase 3: TypeScript Compiler API (1 hour)**
1. Write custom transformer for Date→string pattern
2. Apply to all server files
3. Verify compilation

**Phase 4: Type Assertions (30 min)**
1. Add type assertions for remaining complex cases
2. Document with TODO comments
3. Create follow-up tickets

**Total estimated time: 4 hours to zero errors**

---

## Key Learnings

1. **Don't use regex/sed for code fixes** - Use AST manipulation
2. **Verify after every fix** - Error count should always decrease
3. **Fix mother errors first** - Eliminate cascading failures
4. **Use TypeScript's own tools** - Compiler API > custom scripts
5. **Incremental > Big Bang** - Fix as you go, don't block features

---

*Research completed: February 7, 2026*  
*Sources: GitHub, Automasean Blog, TypeScript Wiki*
