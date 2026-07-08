# 🔐 Environment Variables Setup Guide

## Security Notice
**IMPORTANT**: Never commit API credentials to version control. Always use environment variables for sensitive data.

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# GameLog Backend (Node.js + Postgres)
# URL of the backend that serves auth, reviews, and the IGDB proxy.
# Defaults to http://localhost:3001 if unset. On a physical device use your
# machine's LAN IP, e.g. http://192.168.1.20:3001
EXPO_PUBLIC_API_URL=http://localhost:3001

# Twitch API Configuration
# Get these from https://dev.twitch.tv/console/apps
EXPO_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id_here
EXPO_PUBLIC_TWITCH_ACCESS_TOKEN=your_twitch_access_token_here

# IGDB API Configuration  
# Get these from https://api.igdb.com/
EXPO_PUBLIC_IGDB_CLIENT_ID=your_igdb_client_id_here
EXPO_PUBLIC_IGDB_CLIENT_SECRET=your_igdb_client_secret_here
```

## Backend

The app now uses a self-hosted **Node.js + Postgres** backend (in `backend/`)
instead of Appwrite for authentication and reviews. See
[backend/README.md](backend/README.md) for setup: create a Postgres database,
copy `backend/.env.example` to `backend/.env`, run `npm run db:init`, then
`npm run dev`. Start the backend before running the app.

## How to Get API Credentials

### Twitch API Credentials
1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application or use existing one
3. Copy the **Client ID** and generate an **Access Token**
4. Add them to your `.env` file

### IGDB API Credentials
1. Go to [IGDB API](https://api.igdb.com/)
2. Sign up for an account
3. Create a new application
4. Copy the **Client ID** and **Client Secret**
5. Add them to your `.env` file

## Security Best Practices

1. **Never commit `.env` files** - Add `.env` to your `.gitignore`
2. **Use `.env.example`** - Create a template file with placeholder values
3. **Rotate credentials regularly** - Change API keys periodically
4. **Use different credentials** - Separate dev/staging/production keys
5. **Monitor usage** - Check API usage logs regularly

## Current Status
✅ Hardcoded credentials removed from code
✅ Environment variable integration implemented
✅ Proper error handling for missing credentials
⚠️ **Action Required**: Create `.env` file with your actual credentials

## Troubleshooting

If you see warnings about missing credentials:
1. Check that your `.env` file exists in the project root
2. Verify the variable names match exactly (case-sensitive)
3. Restart your development server after adding variables
4. Check that the `.env` file is not in `.gitignore` (it should be)

## GitGuardian Integration
This setup ensures GitGuardian won't detect exposed credentials in your codebase.
