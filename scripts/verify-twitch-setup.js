#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Twitch Setup Verification');
console.log('===========================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env file not found');
  console.log('   Run: node scripts/setup-twitch.js');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for required variables
const requiredVars = [
  'EXPO_PUBLIC_TWITCH_CLIENT_ID',
  'EXPO_PUBLIC_TWITCH_ACCESS_TOKEN'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`);
  const match = envContent.match(regex);
  
  if (!match || match[1].includes('your_') || match[1].trim() === '') {
    console.log(`❌ ${varName} not configured`);
    allConfigured = false;
  } else {
    console.log(`✅ ${varName} configured`);
  }
});

console.log('\n📋 Setup Status:');
if (allConfigured) {
  console.log('✅ All Twitch API credentials are configured!');
  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your development server');
  console.log('2. Open any game detail page');
  console.log('3. Click the "Live" tab');
  console.log('4. You should see live streams!');
} else {
  console.log('❌ Some credentials are missing');
  console.log('\n📚 Setup Guide:');
  console.log('1. Go to https://dev.twitch.tv/console/apps');
  console.log('2. Create a new application');
  console.log('3. Get your Client ID and Access Token');
  console.log('4. Update the .env file');
  console.log('5. Run this script again');
}

console.log('\n📖 Documentation:');
console.log('- TWITCH_SETUP_GUIDE.md - Complete setup instructions');
console.log('- TWITCH_INTEGRATION.md - Feature overview');
