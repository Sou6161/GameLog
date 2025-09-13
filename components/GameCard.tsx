import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { IGDBGame } from '@/services/igdbService';

interface GameCardProps {
  game: IGDBGame;
}

export function GameCard({ game }: GameCardProps) {
  const handlePress = () => {
    // Safety check to ensure game.id exists
    if (!game || !game.id) {
      console.warn('GameCard: Invalid game data or missing ID', game);
      return;
    }
    
    router.push({
      pathname: '/game/[id]',
      params: { id: game.id.toString() }
    });
  };

  return (
    <TouchableOpacity className="w-[140px] mr-5 ml-2" onPress={handlePress}>
      <View className="relative mb-3 border-[1px] border-violet-500 rounded-2xl overflow-hidden">
        <Image 
          source={{ uri: game.cover?.url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' }} 
          className="w-[140px] h-[200px] rounded-2xl" 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          className="absolute bottom-0 left-0 right-0 h-[40%]"
        />
        <View className="absolute top-2 right-2 bg-black/90 rounded-xl px-2 py-1 flex-row items-center border border-[#FFD700]">
          <Star size={12} color="#FFD700" weight="fill" />
          <Text className="font-bold text-[11px] text-[#FFD700] ml-0.5">{game.rating ? (game.rating / 10).toFixed(1) : 'N/A'}</Text>
        </View>
        <View className="absolute bottom-2 left-2 bg-[rgba(0,210,255,0.9)] px-2 py-1 rounded-lg border border-[#00D2FF]">
          <Text className="font-semibold text-[9px] text-black">
            {game.genres && game.genres.length > 0 ? game.genres[0].name : 'Unknown'}
          </Text>
        </View>
      </View>
      <View className="px-1">
        <Text className="font-bold text-sm text-white mb-2 leading-[18px]" numberOfLines={2}>{game.name}</Text>
        <Text className="font-medium text-[11px] text-[#00D2FF]">
          {game.genres && game.genres.length > 0 ? game.genres[0].name : 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
