#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up SaaS database...');

try {
  // Create database directory if it doesn't exist
  const dbPath = path.join(__dirname, '../prisma');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  // Check if .env exists
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Please create it with DATABASE_URL');
    process.exit(1);
  }

  console.log('✅ Database setup completed!');
  console.log('📊 You can now:');
  console.log('   - Run "npm run dev" to start the development server');
  console.log('   - Visit /admin to access the SaaS dashboard');
  console.log('   - Use the contact form to test database functionality');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}