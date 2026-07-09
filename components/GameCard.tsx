import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';
import { router } from 'expo-router';
import { IGDBGame } from '@/services/igdbService';
import { colors, glow, alpha } from '@/constants/theme';

interface GameCardProps {
  game: IGDBGame;
}

export function GameCard({ game }: GameCardProps) {
  const handlePress = () => {
    if (!game || !game.id) {
      console.warn('GameCard: Invalid game data or missing ID', game);
      return;
    }
    router.push({ pathname: '/game/[id]', params: { id: game.id.toString() } });
  };

  const rating = game.rating ? (game.rating / 10).toFixed(1) : null;
  const genre = game.genres && game.genres.length > 0 ? game.genres[0].name : null;

  return (
    <TouchableOpacity className="w-[148px] mr-4" activeOpacity={0.85} onPress={handlePress}>
      <View
        className="rounded-[20px] overflow-hidden mb-3"
        style={{
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
          ...glow(colors.teal, 0.22, 12),
        }}
      >
        <Image
          source={{ uri: game.cover?.url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' }}
          className="w-[148px] h-[208px]"
        />
        {/* Solid legibility scrim */}
        <View className="absolute bottom-0 left-0 right-0 h-[42%]" style={{ backgroundColor: colors.void, opacity: 0.5 }} />

        {/* Rating pill */}
        {rating && (
          <View
            className="absolute top-2.5 right-2.5 flex-row items-center px-2 py-1 rounded-full"
            style={{ backgroundColor: alpha(colors.void, 0.82), borderWidth: 1, borderColor: alpha(colors.gold, 0.6) }}
          >
            <Star size={11} color={colors.gold} weight="fill" />
            <Text className="font-bold text-[11px] ml-1" style={{ color: colors.gold }}>{rating}</Text>
          </View>
        )}

        {/* Genre chip */}
        {genre && (
          <View className="absolute bottom-2.5 left-2.5 rounded-lg px-2 py-1" style={{ backgroundColor: colors.teal }}>
            <Text className="font-bold text-[9px] tracking-wide uppercase" style={{ color: colors.void }} numberOfLines={1}>{genre}</Text>
          </View>
        )}
      </View>

      <Text className="font-bold text-[13px] leading-[17px]" style={{ color: colors.text }} numberOfLines={2}>
        {game.name}
      </Text>
      {genre && (
        <Text className="font-medium text-[11px] mt-1" style={{ color: colors.textMuted }} numberOfLines={1}>
          {genre}
        </Text>
      )}
    </TouchableOpacity>
  );
}
