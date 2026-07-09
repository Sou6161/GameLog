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
  console.log('CommunityReviewCard - User Avatar:', review.userAvatar);
  console.log('CommunityReviewCard - Username:', review.username);
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
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateString.includes('T')) {
        // ISO format
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Date string format
        date = new Date(dateString);
      } else {
        // Timestamp format
        date = new Date(parseInt(dateString));
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };

  return (
    <View className="bg-[#1A1A2E] rounded-2xl p-4 mb-3 border border-[#374151]/50 mx-1 min-h-[200px]">
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
        className="flex-row items-center mb-4"
        onPress={() => onUserPress?.(review.userId)}
        activeOpacity={0.7}
      >
        <View className="relative">
          {review.userAvatar ? (
            <Image
              source={{ uri: review.userAvatar }}
              className="w-12 h-12 rounded-full border-2 border-[#374151]"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-12 h-12 rounded-full items-center justify-center border-2 border-[#374151]"
              style={{ backgroundColor: '#14C8B0' }}
            >
              <Text className="font-bold text-lg" style={{ color: '#06090D' }}>
                {review.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          {review.verified && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full items-center justify-center">
              <ShieldCheck size={10} color="#FFFFFF" weight="fill" />
            </View>
          )}
        </View>
        
        <View className="ml-3 flex-1">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
              {review.username}
            </Text>
            {review.verified && (
              <Text className="text-blue-400 text-xs ml-2 font-medium bg-blue-500/20 px-2 py-0.5 rounded-full">
                VERIFIED
              </Text>
            )}
          </View>
          <Text className="text-gray-400 text-sm mt-0.5">
            {formatDate(review.date)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Rating */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center mr-2">
          {renderStars(Math.min(Math.max(review.rating, 0), 5))}
        </View>
        <Text className="text-gray-300 text-xs w-full">
          {Math.min(Math.max(review.rating, 0), 5)}/5
        </Text>
      </View>

      {/* Review Text */}
      <Text className="text-gray-200 text-sm leading-6 mb-4">
        {review.reviewText}
      </Text>

      {/* Game Details */}
      {(review.playTime || review.difficulty || review.platform) && (
        <View className="flex-row flex-wrap mb-4 gap-2">
          {review.playTime && (
            <View className="bg-[#374151]/60 px-3 py-2 rounded-full flex-row items-center border border-[#4B5563]/30">
              <Clock size={14} color="#9CA3AF" weight="bold" />
              <Text className="text-gray-300 text-sm ml-1.5 font-medium">
                {review.playTime}h
              </Text>
            </View>
          )}
          {review.difficulty && (
            <View className="bg-[#374151]/60 px-3 py-2 rounded-full flex-row items-center border border-[#4B5563]/30">
              <GameController size={14} color="#9CA3AF" weight="bold" />
              <Text className="text-gray-300 text-sm ml-1.5 font-medium">
                {review.difficulty}
              </Text>
            </View>
          )}
          {review.platform && (
            <View className="bg-[#374151]/60 px-3 py-2 rounded-full border border-[#4B5563]/30">
              <Text className="text-gray-300 text-sm font-medium">
                {review.platform.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {review.tags.slice(0, 4).map((tag, index) => (
            <View key={index} className="bg-green-600/25 px-3 py-1.5 rounded-full border border-green-500/20">
              <Text className="text-green-400 text-sm font-medium">{tag}</Text>
            </View>
          ))}
          {review.tags.length > 4 && (
            <View className="bg-gray-600/25 px-3 py-1.5 rounded-full border border-gray-500/20">
              <Text className="text-gray-400 text-sm font-medium">+{review.tags.length - 4}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
