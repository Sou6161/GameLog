import 'dotenv/config';

export default {
  expo: {
    name: "GameLog",
    slug: "gamelog",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/Gamelog App logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/Gamelog App logo.png"
    },
    plugins: ["expo-router", "expo-font", "expo-web-browser"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "d3e2232d-e04d-441c-aa47-0f0d722376da"
      },
      // Environment variables
      igdbClientId: process.env.EXPO_PUBLIC_IGDB_CLIENT_ID,
      igdbClientSecret: process.env.EXPO_PUBLIC_IGDB_CLIENT_SECRET,
      twitchClientId: process.env.EXPO_PUBLIC_TWITCH_CLIENT_ID,
      twitchAccessToken: process.env.EXPO_PUBLIC_TWITCH_ACCESS_TOKEN,
    },
    android: {
      package: "com.sourabh6161.gamelog"
    }
  }
};
