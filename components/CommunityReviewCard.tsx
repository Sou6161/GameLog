import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Clock, GameController, ShieldCheck } from 'phosphor-react-native';
import { CommunityReview } from '@/services/communityService';

interface CommunityReviewCardProps {
  review: CommunityReview;
  onUserPress?: (userId: string) => void;
  gameName?: string;
  showGameName?: boolean;
}

export default function CommunityReviewCard({ 
  review, 
  onUserPress,
  gameName,
  showGameName = false
}: CommunityReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        color={index < rating ? '#FFD700' : '#374151'}
        weight={index < rating ? 'fill' : 'regular'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="bg-[#1A1A2E] rounded-2xl p-3 mb-3 border border-[#374151]/50 mx-1">
      {/* Game Name Header (only show when showGameName is true) */}
      {showGameName && gameName && (
        <View className="mb-3 pb-2 border-b border-[#374151]/30">
          <Text className="text-[#00D2FF] font-semibold text-sm" numberOfLines={1}>
            {gameName}
          </Text>
        </View>
      )}

      {/* User Header */}
      <TouchableOpacity 
        className="flex-row items-center mb-3"
        onPress={() => onUserPress?.(review.userId)}
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{ uri: review.userAvatar || 'https://via.placeholder.com/40' }}
            className="w-8 h-8 rounded-full"
            resizeMode="cover"
          />
          {review.verified && (
            <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full items-center justify-center">
              <ShieldCheck size={8} color="#FFFFFF" weight="fill" />
            </View>
          )}
        </View>
        
        <View className="ml-2 flex-1">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {review.username}
            </Text>
            {review.verified && (
              <Text className="text-blue-400 text-xs ml-2 font-medium">
                VERIFIED
              </Text>
            )}
          </View>
          <Text className="text-gray-400 text-xs">
            {formatDate(review.date)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Rating */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center mr-2">
          {renderStars(review.rating)}
        </View>
        <Text className="text-gray-300 text-xs">
          {review.rating}/5 stars
        </Text>
      </View>

      {/* Review Text */}
      <Text className="text-gray-200 text-sm leading-5 mb-3" numberOfLines={3}>
        {review.reviewText}
      </Text>

      {/* Game Details */}
      {(review.playTime || review.difficulty || review.platform) && (
        <View className="flex-row flex-wrap mb-3">
          {review.playTime && (
            <View className="bg-[#374151]/50 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-gray-300 text-xs">
                <Clock size={10} color="#9CA3AF" weight="bold" className="mr-1" />
                {review.playTime}h
              </Text>
            </View>
          )}
          {review.difficulty && (
            <View className="bg-[#374151]/50 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-gray-300 text-xs">
                <GameController size={10} color="#9CA3AF" weight="bold" className="mr-1" />
                {review.difficulty}
              </Text>
            </View>
          )}
          {review.platform && (
            <View className="bg-[#374151]/50 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-gray-300 text-xs">
                {review.platform}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {review.tags.slice(0, 3).map((tag, index) => (
            <View key={index} className="bg-green-600/20 px-2 py-1 rounded mr-1 mb-1">
              <Text className="text-green-400 text-xs">{tag}</Text>
            </View>
          ))}
          {review.tags.length > 3 && (
            <View className="bg-gray-600/20 px-2 py-1 rounded mr-1 mb-1">
              <Text className="text-gray-400 text-xs">+{review.tags.length - 3}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
