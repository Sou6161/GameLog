import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, Heart } from 'phosphor-react-native';

interface FeedItem {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  game: {
    title: string;
    coverUrl: string;
  };
  action: string;
  rating?: number;
  timeAgo: string;
}

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  return (
    <TouchableOpacity className="bg-[#1A2238] rounded-xl p-4 mb-4 border border-[#374151]">
      <View className="flex-row items-center mb-3">
        <Image source={{ uri: item.user.avatar }} className="w-10 h-10 rounded-full border-2 border-[#22D3EE]" />
        <View className="flex-1 ml-3">
          <Text className="font-bold text-base text-[#E2E8F0]">{item.user.username}</Text>
          <Text className="font-normal text-sm text-[#94A3B8] mt-0.5">
            {item.action} <Text className="font-bold text-base text-[#22D3EE]">{item.game.title}</Text>
          </Text>
          <Text className="font-normal text-xs text-[#94A3B8] mt-0.5">{item.timeAgo}</Text>
        </View>
      </View>
      
      <View className="flex-row mb-3">
        <Image source={{ uri: item.game.coverUrl }} className="w-[60px] h-[80px] rounded-lg border border-[#22D3EE]" />
        <View className="flex-1 ml-3 justify-center">
          <Text className="font-bold text-base text-[#22D3EE] mb-1">{item.game.title}</Text>
          {item.rating && (
            <View className="flex-row items-center">
              <Star size={16} color="#F59E0B" weight="fill" />
              <Text className="font-medium text-sm text-[#F59E0B] ml-1">{item.rating}/10</Text>
            </View>
          )}
        </View>
      </View>
      
      <View className="flex-row justify-end">
        <TouchableOpacity className="flex-row items-center px-3 py-1.5">
          <Heart size={20} color="#94A3B8" weight="bold" />
          <Text className="font-medium text-sm text-[#94A3B8] ml-1">12</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
