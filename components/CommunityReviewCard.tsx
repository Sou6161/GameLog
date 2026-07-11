import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, GameController, ShieldCheck, ThumbsUp } from 'phosphor-react-native';
import { colors, alpha } from '@/constants/theme';
import { formatReviewDate } from '@/lib/format';

export interface CommunityReviewData {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number; // 0–10
  reviewText: string;
  playTime?: string;
  difficulty?: string;
  platform?: string;
  tags?: string[];
  date: string;
  verified?: boolean;
  helpful?: number;
  helpfulByMe?: boolean;
}

interface Props {
  review: CommunityReviewData;
  onUserPress?: (userId: string) => void;
  onHelpful?: (reviewId: string) => void;
  gameName?: string;
  showGameName?: boolean;
}

export default function CommunityReviewCard({ review, onUserPress, onHelpful, gameName, showGameName = false }: Props) {
  const rating10 = Math.min(Math.max(review.rating, 0), 10);
  const stars = Math.round(rating10 / 2); // 0–5 filled

  return (
    <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      {showGameName && gameName && (
        <View className="mb-3 pb-2" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text className="font-semibold text-sm" style={{ color: colors.tealBright }} numberOfLines={1}>{gameName}</Text>
        </View>
      )}

      {/* Reviewer */}
      <TouchableOpacity className="flex-row items-center mb-3" onPress={() => onUserPress?.(review.userId)} activeOpacity={0.7}>
        <View className="relative">
          {review.userAvatar ? (
            <Image source={{ uri: review.userAvatar }} className="w-11 h-11 rounded-full" style={{ borderWidth: 2, borderColor: colors.elevated }} resizeMode="cover" />
          ) : (
            <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: colors.teal }}>
              <Text className="font-bold text-lg" style={{ color: colors.void }}>{review.username?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          )}
          {review.verified && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: colors.blue }}>
              <ShieldCheck size={10} color="#FFFFFF" weight="fill" />
            </View>
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-base" style={{ color: colors.text }} numberOfLines={1}>{review.username}</Text>
          <Text className="text-sm mt-0.5" style={{ color: colors.textMuted }}>{formatReviewDate(review.date)}</Text>
        </View>
        {/* Rating pill */}
        <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ backgroundColor: alpha(colors.gold, 0.14) }}>
          <Star size={13} color={colors.gold} weight="fill" />
          <Text className="font-bold text-sm ml-1" style={{ color: colors.gold }}>{rating10}/10</Text>
        </View>
      </TouchableOpacity>

      {/* Stars */}
      <View className="flex-row items-center mb-2.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={14} color={i < stars ? colors.gold : alpha(colors.text, 0.16)} weight={i < stars ? 'fill' : 'regular'} />
        ))}
      </View>

      {/* Text */}
      {!!review.reviewText && <Text className="text-sm leading-6 mb-3" style={{ color: colors.textDim }}>{review.reviewText}</Text>}

      {/* Play details */}
      {(review.playTime || review.difficulty || review.platform) && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {review.playTime && (
            <View className="px-3 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: colors.elevated }}>
              <Clock size={13} color={colors.textMuted} weight="bold" />
              <Text className="text-sm ml-1.5" style={{ color: colors.textDim }}>{review.playTime}h</Text>
            </View>
          )}
          {review.difficulty && (
            <View className="px-3 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: colors.elevated }}>
              <GameController size={13} color={colors.textMuted} weight="bold" />
              <Text className="text-sm ml-1.5" style={{ color: colors.textDim }}>{review.difficulty}</Text>
            </View>
          )}
          {review.platform && (
            <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.elevated }}>
              <Text className="text-sm" style={{ color: colors.textDim }}>{review.platform}</Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {review.tags.slice(0, 4).map((tag, i) => (
            <View key={i} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: alpha(colors.lime, 0.14) }}>
              <Text className="text-sm font-medium" style={{ color: colors.lime }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Helpful */}
      <View className="flex-row items-center justify-between pt-1" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          onPress={() => onHelpful?.(review.id)}
          disabled={!onHelpful}
          className="flex-row items-center px-3 py-2 rounded-full mt-2"
          style={{ backgroundColor: review.helpfulByMe ? alpha(colors.teal, 0.16) : colors.elevated }}
          activeOpacity={0.8}
        >
          <ThumbsUp size={16} color={review.helpfulByMe ? colors.tealBright : colors.textMuted} weight={review.helpfulByMe ? 'fill' : 'bold'} />
          <Text className="font-semibold text-sm ml-2" style={{ color: review.helpfulByMe ? colors.tealBright : colors.textMuted }}>
            Helpful{review.helpful ? ` · ${review.helpful}` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
