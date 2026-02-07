import { getDb } from './server/db.js';
import { users, distributors } from './drizzle/schema';
import { eq, like, or } from 'drizzle-orm';

async function fixDistributorAccess() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('\n=== Distributor Access Diagnostic ===\n');

  // Step 1: Find Dakota Rea's user record
  console.log('Step 1: Finding Dakota Rea in users table...');
  const dakotaUsers = await db
    .select()
    .from(users)
    .where(
      or(
        like(users.name, '%Dakota%'),
        like(users.name, '%Rea%'),
        like(users.email, '%dakota%')
      )
    );

  console.log(`Found ${dakotaUsers.length} matching users:`);
  dakotaUsers.forEach(u => {
    console.log(`  - User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
  });

  if (dakotaUsers.length === 0) {
    console.error('ERROR: No user found matching Dakota Rea');
    return;
  }

  const dakotaUser = dakotaUsers[0]; // Take first match
  console.log(`\nUsing User ID: ${dakotaUser.id} (${dakotaUser.name})`);

  // Step 2: Check if distributor record exists for this user
  console.log('\nStep 2: Checking for distributor record...');
  const existingDist = await db
    .select()
    .from(distributors)
    .where(eq(distributors.userId, dakotaUser.id))
    .limit(1);

  if (existingDist.length > 0) {
    console.log('✅ Distributor record FOUND!');
    console.log(`   Distributor ID: ${existingDist[0].id}`);
    console.log(`   Name: ${existingDist[0].firstName} ${existingDist[0].lastName}`);
    console.log(`   Status: ${existingDist[0].status}`);
    console.log(`   Rank: ${existingDist[0].rank}`);
    console.log('\n✅ NO FIX NEEDED - Distributor access should work');
    return;
  }

  console.log('❌ No distributor record found for this userId');

  // Step 3: Find orphaned distributor records (Dakota Rea without correct userId)
  console.log('\nStep 3: Looking for orphaned distributor records...');
  const allDistributors = await db.select().from(distributors);
  
  console.log(`\nAll distributors in database (${allDistributors.length}):`);
  allDistributors.forEach(d => {
    console.log(`  - Dist ID: ${d.id}, UserId: ${d.userId}, Name: ${d.firstName} ${d.lastName}, Email: ${d.email}`);
  });

  // Find Dakota Rea's distributor record by name/email
  const dakotaDistributor = allDistributors.find(d => 
    (d.firstName?.toLowerCase().includes('dakota') || 
     d.lastName?.toLowerCase().includes('rea') ||
     d.email?.toLowerCase().includes('dakota'))
  );

  if (!dakotaDistributor) {
    console.error('\n❌ ERROR: No distributor record found for Dakota Rea at all!');
    console.log('   User needs to complete distributor enrollment process');
    return;
  }

  console.log(`\n✅ Found orphaned distributor record:`);
  console.log(`   Distributor ID: ${dakotaDistributor.id}`);
  console.log(`   Current userId: ${dakotaDistributor.userId}`);
  console.log(`   Name: ${dakotaDistributor.firstName} ${dakotaDistributor.lastName}`);

  // Step 4: Fix the linkage
  console.log(`\nStep 4: Fixing userId linkage...`);
  console.log(`   Updating distributor ${dakotaDistributor.id} to userId ${dakotaUser.id}`);

  await db
    .update(distributors)
    .set({ userId: dakotaUser.id })
    .where(eq(distributors.id, dakotaDistributor.id));

  console.log('✅ FIXED! Distributor record now linked to correct user');

  // Step 5: Set as master distributor
  console.log('\nStep 5: Setting Dakota Rea as Master Distributor...');
  await db
    .update(distributors)
    .set({
      rank: 'master_distributor',
      status: 'active',
      isActive: 1,
    })
    .where(eq(distributors.id, dakotaDistributor.id));

  console.log('✅ Dakota Rea is now Master Distributor (always active, always qualified)');
  console.log('\n=== FIX COMPLETE ===\n');
}

// Run the fix
fixDistributorAccess()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
