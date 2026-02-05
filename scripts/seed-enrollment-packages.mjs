import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedEnrollmentPackages() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  console.log('Seeding enrollment packages...');

  const packages = [
    {
      name: 'Starter Package',
      slug: 'starter',
      description: 'Perfect for getting started with your NEON business. Includes essential products and basic training materials.',
      price: 9900, // $99.00
      businessVolume: 50,
      productQuantity: 12, // 12 cans
      productDetails: JSON.stringify({
        items: [
          { name: 'NEON Energy Drink (12-pack)', quantity: 1 },
          { name: 'Digital Marketing Kit', quantity: 1 },
          { name: 'Basic Training Access', quantity: 1 }
        ]
      }),
      marketingMaterialsIncluded: true,
      trainingAccessLevel: 'basic',
      fastStartBonusEligible: false,
      isActive: true,
      displayOrder: 1
    },
    {
      name: 'Pro Package',
      slug: 'pro',
      description: 'Accelerate your success with more products, advanced training, and fast start bonus eligibility.',
      price: 29900, // $299.00
      businessVolume: 150,
      productQuantity: 48, // 48 cans (2 cases)
      productDetails: JSON.stringify({
        items: [
          { name: 'NEON Energy Drink (2 cases)', quantity: 2 },
          { name: 'Premium Marketing Kit', quantity: 1 },
          { name: 'Advanced Training Access', quantity: 1 },
          { name: 'Branded Business Cards (500)', quantity: 1 },
          { name: 'Sample Pack (24 cans)', quantity: 1 }
        ]
      }),
      marketingMaterialsIncluded: true,
      trainingAccessLevel: 'advanced',
      fastStartBonusEligible: true,
      isActive: true,
      displayOrder: 2
    },
    {
      name: 'Elite Package',
      slug: 'elite',
      description: 'The ultimate package for serious entrepreneurs. Maximum products, premium training, and exclusive benefits.',
      price: 59900, // $599.00
      businessVolume: 300,
      productQuantity: 120, // 120 cans (5 cases)
      productDetails: JSON.stringify({
        items: [
          { name: 'NEON Energy Drink (5 cases)', quantity: 5 },
          { name: 'Elite Marketing Suite', quantity: 1 },
          { name: 'Premium Training Access', quantity: 1 },
          { name: 'Branded Business Cards (1000)', quantity: 1 },
          { name: 'Sample Pack (48 cans)', quantity: 2 },
          { name: 'Custom Branded Merchandise', quantity: 1 },
          { name: '1-on-1 Success Coaching (3 sessions)', quantity: 1 }
        ]
      }),
      marketingMaterialsIncluded: true,
      trainingAccessLevel: 'premium',
      fastStartBonusEligible: true,
      isActive: true,
      displayOrder: 3
    }
  ];

  for (const pkg of packages) {
    try {
      await db.insert(schema.enrollmentPackages).values(pkg);
      console.log(`✓ Created ${pkg.name}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`- ${pkg.name} already exists, skipping...`);
      } else {
        console.error(`✗ Error creating ${pkg.name}:`, error.message);
      }
    }
  }

  await connection.end();
  console.log('Enrollment packages seeded successfully!');
}

seedEnrollmentPackages().catch((error) => {
  console.error('Error seeding enrollment packages:', error);
  process.exit(1);
});
