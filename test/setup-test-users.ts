/**
 * Setup Test Users for Load Testing
 * 
 * Creates 1000 test distributor accounts for authenticated load testing
 * Each user has:
 * - Unique email (loadtest1@neonenergy.test through loadtest1000@neonenergy.test)
 * - Same password (LoadTest123!)
 * - Distributor role
 * - Binary tree placement
 * - Sample commission history
 * 
 * Usage:
 *   pnpm tsx test/setup-test-users.ts
 */

import { getDb } from '../server/db';
import { users, distributors, commissions } from '../drizzle/schema';
import bcrypt from 'bcryptjs';

const TEST_USER_COUNT = 1000;
const TEST_PASSWORD = 'LoadTest123!';
const TEST_EMAIL_DOMAIN = 'neonenergy.test';

async function setupTestUsers() {
  console.log(`Setting up ${TEST_USER_COUNT} test users...`);
  
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= TEST_USER_COUNT; i++) {
    const email = `loadtest${i}@${TEST_EMAIL_DOMAIN}`;
    const name = `Load Test User ${i}`;

    try {
      // Check if user already exists
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (existing) {
        skipped++;
        if (i % 100 === 0) {
          console.log(`Progress: ${i}/${TEST_USER_COUNT} (${created} created, ${skipped} skipped)`);
        }
        continue;
      }

      // Create user
      const [user] = await db.insert(users).values({
        email,
        name,
        passwordHash: hashedPassword,
        role: 'distributor',
        openId: `loadtest-${i}`,
        emailVerified: true,
        twoFactorEnabled: false,
      });

      // Create distributor record
      await db.insert(distributors).values({
        userId: user.id,
        sponsorId: i > 1 ? Math.floor(Math.random() * (i - 1)) + 10001 : null, // Random upline
        rank: 'Associate',
        personalVolume: Math.floor(Math.random() * 1000),
        teamVolume: Math.floor(Math.random() * 5000),
        leftLegVolume: Math.floor(Math.random() * 2500),
        rightLegVolume: Math.floor(Math.random() * 2500),
      });

      // Create sample commission history (3-5 records per user)
      const commissionCount = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < commissionCount; j++) {
        await db.insert(commissions).values({
          distributorId: user.id,
          type: j % 2 === 0 ? 'binary' : 'fast_start',
          amount: Math.floor(Math.random() * 200) + 50, // $50-$250
          level: Math.floor(Math.random() * 5) + 1,
          description: `Test commission ${j + 1}`,
          status: 'paid',
        });
      }

      created++;

      // Progress update every 100 users
      if (i % 100 === 0) {
        console.log(`Progress: ${i}/${TEST_USER_COUNT} (${created} created, ${skipped} skipped)`);
      }
    } catch (error) {
      console.error(`Error creating user ${i}:`, error);
    }
  }

  console.log('\n✅ Test user setup complete!');
  console.log(`Created: ${created} users`);
  console.log(`Skipped: ${skipped} users (already existed)`);
  console.log(`\nTest credentials:`);
  console.log(`  Email: loadtest1@${TEST_EMAIL_DOMAIN} through loadtest${TEST_USER_COUNT}@${TEST_EMAIL_DOMAIN}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`\nYou can now run: k6 run --vus 100 --duration 5m test/authenticated-load-test.k6.js`);
}

// Run setup
setupTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
