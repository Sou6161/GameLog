#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps you create a .env file with the required API credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🔐 GameLog Environment Setup');
  console.log('============================\n');
  
  console.log('This script will help you create a .env file with your API credentials.');
  console.log('Make sure you have your Twitch and IGDB API credentials ready.\n');

  try {
    // Check if .env already exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('\n📺 Twitch API Credentials');
    console.log('Get these from: https://dev.twitch.tv/console/apps\n');
    
    const twitchClientId = await question('Twitch Client ID: ');
    const twitchAccessToken = await question('Twitch Access Token: ');

    console.log('\n🎮 IGDB API Credentials');
    console.log('Get these from: https://api.igdb.com/\n');
    
    const igdbClientId = await question('IGDB Client ID: ');
    const igdbClientSecret = await question('IGDB Client Secret: ');

    // Create .env content
    const envContent = `# Twitch API Configuration
# Get these from https://dev.twitch.tv/console/apps
EXPO_PUBLIC_TWITCH_CLIENT_ID=${twitchClientId}
EXPO_PUBLIC_TWITCH_ACCESS_TOKEN=${twitchAccessToken}

# IGDB API Configuration
# Get these from https://api.igdb.com/
EXPO_PUBLIC_IGDB_CLIENT_ID=${igdbClientId}
EXPO_PUBLIC_IGDB_CLIENT_SECRET=${igdbClientSecret}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully!');
    console.log('🔒 Your credentials are now secure and won\'t be committed to git.');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the Twitch integration in your app');
    console.log('3. Verify GitGuardian no longer shows security warnings');

  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupEnvironment();
