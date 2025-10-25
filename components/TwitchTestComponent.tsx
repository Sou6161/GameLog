import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { twitchService } from '../services/twitchService';

export const TwitchTestComponent: React.FC = () => {
  const [testing, setTesting] = useState(false);

  const testTwitchConnection = async () => {
    setTesting(true);
    try {
      const isConnected = await twitchService.testConnection();
      if (isConnected) {
        Alert.alert('✅ Success', 'Twitch API connection is working!');
      } else {
        Alert.alert('❌ Failed', 'Twitch API connection failed. Check your credentials.');
      }
    } catch (error) {
      Alert.alert('❌ Error', `Connection test failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const testGameSearch = async () => {
    setTesting(true);
    try {
      const streams = await twitchService.getLiveStreamsByGame('Minecraft', 5);
      Alert.alert(
        '🎮 Game Search Test', 
        `Found ${streams.length} live streams for Minecraft`
      );
    } catch (error) {
      Alert.alert('❌ Error', `Game search failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="p-4 bg-gray-800 rounded-xl m-4">
      <Text className="text-white text-lg font-bold mb-4">Twitch API Test</Text>
      
      <TouchableOpacity
        onPress={testTwitchConnection}
        disabled={testing}
        className="bg-blue-600 p-3 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-semibold">
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={testGameSearch}
        disabled={testing}
        className="bg-green-600 p-3 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">
          {testing ? 'Testing...' : 'Test Game Search'}
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-400 text-sm mt-3">
        Make sure to set your Twitch API credentials in .env file
      </Text>
    </View>
  );
};
