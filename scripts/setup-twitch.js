#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎮 Twitch API Setup Script');
console.log('========================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Twitch API Configuration
# Get these from https://dev.twitch.tv/console/apps
EXPO_PUBLIC_TWITCH_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_TWITCH_ACCESS_TOKEN=your_access_token_here

# Appwrite Configuration (if not already set)
EXPO_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://dev.twitch.tv/console/apps');
console.log('2. Create a new application');
console.log('3. Get your Client ID and Access Token');
console.log('4. Update the .env file with your credentials');
console.log('5. Restart your development server');

console.log('\n🔧 Quick Test:');
console.log('Add the TwitchTestComponent to any page to test your setup');

console.log('\n📚 Documentation:');
console.log('- Setup Guide: TWITCH_SETUP_GUIDE.md');
console.log('- Integration Guide: TWITCH_INTEGRATION.md');
