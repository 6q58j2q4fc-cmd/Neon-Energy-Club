# TypeScript Error Fix Research Findings

## Key Discovery 1: tRPC Date→String Serialization

**Source:** https://stackoverflow.com/questions/77396906

**Problem:** tRPC uses JSON serialization which converts `Date` objects to ISO strings automatically.

**Solution:** Use superjson transformer to preserve Date types
- Documentation: https://trpc.io/docs/server/data-transformers#using-superjson
- This is already configured in our project (server/_core/trpc.ts uses superjson)

**Impact on our errors:**
- TS2322 errors expecting string but getting Date are FALSE POSITIVES
- Superjson handles Date serialization automatically
- We should NOT convert Date→string manually in most cases

## Key Discovery 2: Prisma Schema Drift

**Common causes:**
1. Schema changes not regenerated (`pnpm prisma generate`)
2. TypeScript server cache not restarted
3. Missing properties in schema vs. code expectations

**Solution:**
1. Run `pnpm prisma generate` to regenerate types
2. Restart TypeScript server in IDE
3. Add missing properties to schema OR use optional chaining

## Key Discovery 3: MySQL TINYINT Boolean Conversion

**Source:** Multiple Stack Overflow threads

**Problem:** MySQL stores boolean as TINYINT(1), returns 0/1 not true/false

**Solutions:**
1. Use `!!value` to convert to boolean: `!!u.infected`
2. Use `Boolean(value)` explicitly
3. Configure Prisma to handle this automatically

**Impact on our errors:**
- TS2322 errors with boolean→number are REAL
- Need explicit conversion in both directions:
  - DB→Code: `!!value` or `Boolean(value)`
  - Code→DB: `value ? 1 : 0` or `Number(value)`

## Key Discovery 4: TypeScript Type Guards for TS2551

**Pattern:**
```typescript
// Instead of:
if (obj.property) { ... } // TS2551: Property may not exist

// Use type guard:
if ('property' in obj && obj.property) { ... }

// Or optional chaining:
obj.property?.method()
```

## Action Plan

1. **DO NOT manually convert Date→string** (superjson handles it)
2. **Add missing schema properties** or use optional chaining
3. **Convert boolean↔number explicitly** for MySQL TINYINT
4. **Use type guards** for TS2551 errors
5. **Regenerate Prisma types** to sync schema
