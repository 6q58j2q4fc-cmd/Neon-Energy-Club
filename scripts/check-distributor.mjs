import mysql from 'mysql2/promise';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Connected to database');

// Check status column definition
const [columns] = await connection.query("SHOW COLUMNS FROM distributors WHERE Field = 'status'");
console.log('\nStatus column definition:');
console.log(JSON.stringify(columns, null, 2));

// Check actual distributor data
const [rows] = await connection.query("SELECT id, distributorCode, status, isActive FROM distributors LIMIT 5");
console.log('\nDistributor data:');
console.log(JSON.stringify(rows, null, 2));

// Check if DIST1 exists
const [dist1] = await connection.query("SELECT * FROM distributors WHERE distributorCode = 'DIST1'");
console.log('\nDIST1 data:');
console.log(JSON.stringify(dist1, null, 2));

await connection.end();
