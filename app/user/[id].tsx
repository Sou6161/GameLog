import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Lock } from 'phosphor-react-native';
import CommunityReviewCard from '@/components/CommunityReviewCard';
import { ReviewService } from '@/services/reviewService';
import { colors, gradients, glow, alpha } from '@/constants/theme';
import { formatReviewDate } from '@/lib/format';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const userQ = useQuery({
    queryKey: ['publicUser', id],
    queryFn: () => ReviewService.getPublicUser(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
  const reviewsQ = useQuery({
    queryKey: ['publicUserReviews', id],
    queryFn: () => ReviewService.getUserPublicReviews(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const user = userQ.data;
  const reviews = reviewsQ.data || [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;
  const goBack = () => (router.canGoBack() ? router.back() : router.push('/'));

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
        {/* Header bar */}
        <View className="flex-row items-center px-5 pt-2 pb-3">
          <TouchableOpacity
            onPress={goBack}
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <ArrowLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <Text className="font-bold text-lg ml-3" style={{ color: colors.text }}>Profile</Text>
        </View>

        {userQ.isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        ) : !user ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-center" style={{ color: colors.textDim }}>User not found.</Text>
          </View>
        ) : user.private ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Lock size={30} color={colors.textMuted} weight="fill" />
            </View>
            <Text className="font-bold text-xl mb-1" style={{ color: colors.text }}>{user.username}</Text>
            <Text className="text-center" style={{ color: colors.textMuted }}>This profile is private.</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Profile head */}
            <View className="items-center px-5 mb-6">
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-24 h-24 rounded-full" style={{ borderWidth: 3, borderColor: colors.teal, ...glow(colors.teal, 0.4, 14) }} />
              ) : (
                <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.4, 14) }}>
                  <Text className="text-4xl font-bold" style={{ color: colors.void }}>{user.username?.charAt(0)?.toUpperCase() || 'U'}</Text>
                </View>
              )}
              <Text className="font-bold text-2xl mt-3" style={{ color: colors.text }}>{user.username}</Text>
              {user.createdAt && (
                <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>Joined {formatReviewDate(user.createdAt)}</Text>
              )}

              {/* Stat pills */}
              <View className="flex-row gap-3 mt-4">
                <View className="items-center px-5 py-3 rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text className="font-bold text-xl" style={{ color: colors.text }}>{reviews.length}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>Reviews</Text>
                </View>
                {avgRating && (
                  <View className="items-center px-5 py-3 rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                    <View className="flex-row items-center">
                      <Star size={16} color={colors.gold} weight="fill" />
                      <Text className="font-bold text-xl ml-1" style={{ color: colors.gold }}>{avgRating}</Text>
                    </View>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>Avg rating</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Their reviews */}
            <View className="px-4">
              <Text className="font-bold text-xl mb-3 px-1" style={{ color: colors.text }}>Reviews</Text>
              {reviewsQ.isLoading ? (
                <ActivityIndicator color={colors.teal} className="py-8" />
              ) : reviews.length === 0 ? (
                <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text className="text-center" style={{ color: colors.textMuted }}>{user.username} hasn't posted any public reviews yet.</Text>
                </View>
              ) : (
                reviews.map((r) => (
                  <CommunityReviewCard
                    key={r.$id}
                    review={{
                      id: r.$id,
                      userId: r.userId,
                      username: r.username,
                      userAvatar: r.userAvatar,
                      rating: r.rating,
                      reviewText: r.reviewText,
                      playTime: r.playTime,
                      difficulty: r.difficulty,
                      platform: r.platform,
                      tags: typeof r.tags === 'string' ? r.tags.split(',').filter((t) => t.trim()) : [],
                      date: r.date,
                      verified: r.verified,
                      helpful: r.helpful,
                      helpfulByMe: r.helpfulByMe,
                    }}
                    gameName={r.gameName}
                    showGameName
                  />
                ))
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
