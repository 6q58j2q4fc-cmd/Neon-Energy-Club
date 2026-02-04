import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function enrollDakota() {
  try {
    // Find Dakota Rea's user record
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE name = ? LIMIT 1',
      ['Dakota Rea']
    );
    
    if (!users || users.length === 0) {
      console.error('❌ Dakota Rea user not found');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.name, '(ID:', user.id, ')');
    
    // Check if already enrolled
    const [existing] = await connection.execute(
      'SELECT id, distributorCode FROM distributors WHERE userId = ? LIMIT 1',
      [user.id]
    );
    
    if (existing && existing.length > 0) {
      console.log('✅ Dakota Rea is already enrolled as distributor:', existing[0].distributorCode);
      process.exit(0);
    }
    
    // Insert distributor record
    const [result] = await connection.execute(
      `INSERT INTO distributors (
        userId, distributorCode, sponsorId, placementPosition, rank,
        personalSales, teamSales, leftLegVolume, rightLegVolume,
        totalEarnings, availableBalance, monthlyPV, monthlyAutoshipPV,
        activeDownlineCount, isActive, status, country
      ) VALUES (?, ?, NULL, NULL, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, ?, ?)`,
      [user.id, 'DIST00001', 'starter', 'active', 'US']
    );
    
    console.log('✅ Successfully enrolled Dakota Rea as distributor DIST00001');
    console.log('   Distributor ID:', result.insertId);
    
    // Verify enrollment
    const [distributors] = await connection.execute(
      'SELECT * FROM distributors WHERE distributorCode = ? LIMIT 1',
      ['DIST00001']
    );
    
    if (distributors && distributors.length > 0) {
      console.log('✅ Verification successful:', distributors[0]);
    }
    
  } catch (error) {
    console.error('❌ Error enrolling Dakota:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

enrollDakota();
