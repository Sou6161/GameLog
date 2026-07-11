import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trophy, Sparkle, Star } from 'phosphor-react-native';
import { colors, alpha, glow } from '@/constants/theme';
import { useAchievementUiStore } from '@/store/achievementUiStore';

const { width } = Dimensions.get('window');

export default function AchievementUnlockedModal() {
  const current = useAchievementUiStore((s) => s.current);
  const queueLen = useAchievementUiStore((s) => s.queue.length);
  const dismissCurrent = useAchievementUiStore((s) => s.dismissCurrent);

  const visible = !!current;
  const accent = current?.color || colors.gold;

  // Entrance animation for the badge.
  const scale = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      spin.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, current?.id]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] });

  const Icon = current?.icon || Trophy;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissCurrent}>
      <View className="flex-1 justify-center items-center bg-black/70">
        <BlurView intensity={24} tint="dark" className="absolute inset-0" />

        <View
          className="rounded-3xl mx-6 overflow-hidden items-center"
          style={{ width: width - 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: alpha(accent, 0.5) }}
        >
          {/* Accent glow band */}
          <View className="w-full items-center pt-8 pb-4" style={{ backgroundColor: alpha(accent, 0.1) }}>
            {/* Small sparkles */}
            <View className="flex-row items-center mb-4 gap-1.5">
              <Sparkle size={14} color={accent} weight="fill" />
              <Text className="font-bold text-xs tracking-[3px]" style={{ color: accent }}>
                ACHIEVEMENT UNLOCKED
              </Text>
              <Sparkle size={14} color={accent} weight="fill" />
            </View>

            {/* Badge */}
            <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
              <View
                className="w-28 h-28 rounded-full items-center justify-center"
                style={{ backgroundColor: accent, ...glow(accent, 0.55, 26) }}
              >
                <Icon size={52} color={colors.void} weight="fill" />
              </View>
            </Animated.View>
          </View>

          {/* Content */}
          <View className="px-6 pt-5 pb-6 items-center w-full">
            <Text className="font-bold text-2xl text-center" style={{ color: colors.text }}>
              {current?.title}
            </Text>
            <Text className="text-base text-center mt-2 leading-6" style={{ color: colors.textDim }}>
              {current?.description}
            </Text>

            {/* Rarity / points flair */}
            <View className="flex-row items-center mt-4 px-4 py-2 rounded-full" style={{ backgroundColor: alpha(accent, 0.14) }}>
              <Star size={15} color={accent} weight="fill" />
              <Text className="font-bold text-sm ml-2 capitalize" style={{ color: accent }}>
                {current?.category ?? 'reward'}
              </Text>
            </View>

            {queueLen > 0 && (
              <Text className="text-xs mt-4" style={{ color: colors.textMuted }}>
                +{queueLen} more unlocked
              </Text>
            )}

            {/* Action */}
            <TouchableOpacity
              onPress={dismissCurrent}
              activeOpacity={0.9}
              className="w-full rounded-2xl py-4 items-center mt-5"
              style={{ backgroundColor: accent, ...glow(accent, 0.4, 14) }}
            >
              <Text className="font-bold text-base" style={{ color: colors.void }}>
                {queueLen > 0 ? 'Next' : 'Awesome!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
