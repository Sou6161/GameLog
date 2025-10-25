# 🎮 Complete Twitch API Setup Guide

## 🚀 Step-by-Step Setup

### 1. Create Twitch Developer Account
1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Sign in with your Twitch account
3. Click **"Create"** to create a new application

### 2. Create Twitch Application
1. **Name**: `GameLog App` (or any name you prefer)
2. **OAuth Redirect URLs**: 
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. **Category**: Choose "Application Integration"
4. Click **"Create"**

### 3. Get Your Credentials
After creating the app, you'll see:
- **Client ID**: `your_client_id_here`
- **Client Secret**: `your_client_secret_here`

### 4. Get Access Token

#### Option A: Client Credentials Grant (Recommended for public data)
```bash
curl -X POST https://id.twitch.tv/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials"
```

#### Option B: Use Twitch Token Generator
1. Go to [Twitch Token Generator](https://twitchtokengenerator.com/)
2. Select **"App Access Token"**
3. Enter your Client ID and Client Secret
4. Click **"Generate Token"**

### 5. Set Environment Variables

Create a `.env` file in your project root:
```env
# Twitch API Configuration
EXPO_PUBLIC_TWITCH_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_TWITCH_ACCESS_TOKEN=your_access_token_here

# Optional: For testing
EXPO_PUBLIC_TWITCH_CLIENT_SECRET=your_client_secret_here
```

### 6. Test Your Setup

Add this to your app to test the connection:
```javascript
// Test function
const testTwitchConnection = async () => {
  try {
    const response = await fetch('https://api.twitch.tv/helix/games?name=Minecraft', {
      headers: {
        'Client-ID': process.env.EXPO_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_TWITCH_ACCESS_TOKEN}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ Twitch API connection successful!');
      const data = await response.json();
      console.log('Game data:', data);
    } else {
      console.log('❌ Twitch API connection failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
};
```

## 🔧 Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check your Client ID and Access Token
   - Make sure the token is valid (not expired)

2. **403 Forbidden**
   - Your app might need verification for certain endpoints
   - Try using a different access token

3. **Rate Limiting**
   - Twitch has rate limits (30 requests per minute)
   - Implement proper error handling

### Testing Games:
Try these popular games that usually have live streams:
- Minecraft
- Fortnite
- League of Legends
- Valorant
- Among Us
- Fall Guys

## 🎯 Next Steps

1. Set up your credentials
2. Test with a popular game
3. Check the Live Streams tab in your app
4. Verify streams are loading correctly

## 📱 What You'll See

Once set up, users will see:
- Live streamers playing the specific game
- Stream thumbnails and titles
- Viewer counts and stream duration
- Click to watch on Twitch

This feature will make your app **stand out** in the gaming market! 🚀
