import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';
import { router } from 'expo-router';
import { IGDBGame } from '@/services/igdbService';
import { colors, glow, alpha } from '@/constants/theme';

interface GameCardProps {
  game: IGDBGame;
  width?: number;
}

// Poster aspect ratio (IGDB cover_big is 264x374 ≈ 0.706).
const ASPECT = 208 / 148;

export function GameCard({ game, width = 148 }: GameCardProps) {
  const handlePress = () => {
    if (!game || !game.id) {
      console.warn('GameCard: Invalid game data or missing ID', game);
      return;
    }
    router.push({ pathname: '/game/[id]', params: { id: game.id.toString() } });
  };

  const imgHeight = Math.round(width * ASPECT);
  const rating = game.rating ? (game.rating / 10).toFixed(1) : null;
  const genre = game.genres && game.genres.length > 0 ? game.genres[0].name : null;

  return (
    <TouchableOpacity style={{ width }} activeOpacity={0.85} onPress={handlePress}>
      <View
        className="rounded-[20px] overflow-hidden mb-3"
        style={{
          width,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
          ...glow(colors.teal, 0.22, 12),
        }}
      >
        <Image
          source={{ uri: game.cover?.url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' }}
          style={{ width, height: imgHeight }}
        />

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
