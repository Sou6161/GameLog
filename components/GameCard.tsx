import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Game {
  id: string;
  title: string;
  coverUrl: string;
  rating: number;
  genre: string;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <TouchableOpacity className="w-[140px] mr-4">
      <View className="relative mb-3 rounded-2xl overflow-hidden">
        <Image source={{ uri: game.coverUrl }} className="w-[140px] h-[200px] rounded-2xl" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          className="absolute bottom-0 left-0 right-0 h-[40%]"
        />
        <View className="absolute top-2 right-2 bg-black/90 rounded-xl px-2 py-1 flex-row items-center border border-[#FFD700]">
          <Star size={12} color="#FFD700" weight="fill" />
          <Text className="font-bold text-[11px] text-[#FFD700] ml-0.5">{game.rating}</Text>
        </View>
        <View className="absolute bottom-2 left-2 bg-[rgba(0,210,255,0.9)] px-2 py-1 rounded-lg border border-[#00D2FF]">
          <Text className="font-semibold text-[9px] text-black">{game.genre}</Text>
        </View>
      </View>
      <View className="px-1">
        <Text className="font-bold text-sm text-white mb-2 leading-[18px]" numberOfLines={2}>{game.title}</Text>
        <Text className="font-medium text-[11px] text-[#00D2FF]">{game.genre}</Text>
      </View>
    </TouchableOpacity>
  );
}
