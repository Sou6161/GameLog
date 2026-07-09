import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, Heart } from 'phosphor-react-native';
import { colors, glow, alpha } from '@/constants/theme';

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
    <TouchableOpacity
      className="rounded-[20px] p-4 mb-4"
      activeOpacity={0.85}
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: item.user.avatar }}
          className="w-10 h-10 rounded-full"
          style={{ borderWidth: 2, borderColor: colors.teal }}
        />
        <View className="flex-1 ml-3">
          <Text className="font-bold text-base" style={{ color: colors.text }}>{item.user.username}</Text>
          <Text className="font-normal text-sm mt-0.5" style={{ color: colors.textDim }}>
            {item.action} <Text className="font-bold" style={{ color: colors.tealBright }}>{item.game.title}</Text>
          </Text>
          <Text className="font-normal text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.timeAgo}</Text>
        </View>
      </View>

      <View className="flex-row mb-3">
        <Image
          source={{ uri: item.game.coverUrl }}
          className="w-[60px] h-[80px] rounded-xl"
          style={{ borderWidth: 1, borderColor: colors.borderStrong }}
        />
        <View className="flex-1 ml-3 justify-center">
          <Text className="font-bold text-base mb-1" style={{ color: colors.tealBright }}>{item.game.title}</Text>
          {item.rating && (
            <View
              className="flex-row items-center self-start px-2 py-1 rounded-full"
              style={{ backgroundColor: alpha(colors.gold, 0.14) }}
            >
              <Star size={14} color={colors.gold} weight="fill" />
              <Text className="font-bold text-sm ml-1" style={{ color: colors.gold }}>{item.rating}/10</Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row justify-end">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: alpha(colors.coral, 0.12) }}
        >
          <Heart size={18} color={colors.coral} weight="fill" />
          <Text className="font-semibold text-sm ml-1.5" style={{ color: colors.coral }}>12</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
