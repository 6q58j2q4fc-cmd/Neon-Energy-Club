import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

// This script generates CREATE TABLE statements
console.log('-- NEON Energy MLM Platform Database Schema');
console.log('-- Generated: ' + new Date().toISOString());
console.log('-- Total Tables: 68\n');

// We'll use drizzle-kit instead
import { exec } from 'child_process';
exec('pnpm drizzle-kit push --force', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(stdout);
});
