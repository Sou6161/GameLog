import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StatusBar, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameController, Star, Trophy, Heart } from 'phosphor-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress animation
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2800, // 2.8 seconds to reach 100%
      useNativeDriver: false,
    });

    // Update progress percentage
    const progressListener = progressAnim.addListener(({ value }) => {
      const percentage = Math.round(value * 100);
      setProgress(percentage);
      
      // Ensure we reach exactly 100%
      if (value >= 0.99) {
        setProgress(100);
      }
    });

    animation.start();

    // Set 100% after animation completes
    const completeTimer = setTimeout(() => {
      setProgress(100);
    }, 2800);

    // Navigate after splash duration
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
      progressAnim.removeListener(progressListener);
    };
  }, [onFinish, progressAnim]);

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#0E0E10" />
      <LinearGradient
        colors={['#0E0E10', '#18181B', '#1F1F23', '#18181B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        {/* Enhanced Background Pattern */}
        <View className="absolute top-0 left-0 right-0 bottom-0">
          {/* Top decorative elements */}
          <View className="absolute top-[15%] left-[8%] opacity-8">
            <GameController size={32} color="#9146FF" weight="fill" />
          </View>
          <View className="absolute top-[25%] right-[12%] opacity-8">
            <Star size={28} color="#00B5AD" weight="fill" />
          </View>
          
          {/* Middle decorative elements */}
          <View className="absolute top-[45%] left-[5%] opacity-6">
            <Trophy size={24} color="#FFD700" weight="fill" />
          </View>
          <View className="absolute top-[55%] right-[8%] opacity-6">
            <GameController size={26} color="#9146FF" weight="fill" />
          </View>
          
          {/* Bottom decorative elements */}
          <View className="absolute top-[75%] left-[12%] opacity-8">
            <Star size={22} color="#00B5AD" weight="fill" />
          </View>
          <View className="absolute top-[85%] right-[15%] opacity-6">
            <Trophy size={20} color="#FFD700" weight="fill" />
          </View>
          
          {/* Subtle corner accents */}
          <View className="absolute top-[10%] right-[5%] opacity-5">
            <Star size={18} color="#FFFFFF" weight="fill" />
          </View>
          <View className="absolute bottom-[15%] left-[5%] opacity-5">
            <GameController size={16} color="#FFFFFF" weight="fill" />
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-center items-center px-10">
          {/* Logo Container */}
          <View className="items-center mb-12">
            {/* Main Logo with enhanced styling */}
            <View className="w-32 h-32 rounded-full bg-gradient-to-br from-[#9146FF]/20 to-[#9146FF]/5 justify-center items-center mb-6 border-2 border-[#9146FF]/30 shadow-lg shadow-[#9146FF]/20">
              <View className="w-28 h-28 rounded-full bg-[#9146FF]/10 justify-center items-center">
                <GameController size={52} color="#9146FF" weight="fill" />
              </View>
            </View>

            {/* App Name with enhanced typography */}
            <Text className="text-4xl font-black text-white text-center mb-3 tracking-widest">
              GameLog
            </Text>

            {/* Tagline with better styling */}
            <View className="bg-white/5 rounded-full px-6 py-2 border border-white/10">
              <Text className="text-base text-gray-300 text-center font-medium tracking-wide">
                Track • Review • Discover
              </Text>
            </View>
          </View>

          {/* Features Icons with enhanced styling */}
          <View className="flex-row justify-around w-full mb-16 px-4">
            <View className="items-center">
              <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 justify-center items-center mb-3 border border-[#FFD700]/20 shadow-lg shadow-[#FFD700]/10">
                <Trophy size={28} color="#FFD700" weight="fill" />
              </View>
              <Text className="text-gray-300 text-sm font-semibold text-center">
                Achievements
              </Text>
            </View>

            <View className="items-center">
              <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9146FF]/20 to-[#9146FF]/5 justify-center items-center mb-3 border border-[#9146FF]/20 shadow-lg shadow-[#9146FF]/10">
                <Star size={28} color="#9146FF" weight="fill" />
              </View>
              <Text className="text-gray-300 text-sm font-semibold text-center">
                Reviews
              </Text>
            </View>

            <View className="items-center">
              <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00B5AD]/20 to-[#00B5AD]/5 justify-center items-center mb-3 border border-[#00B5AD]/20 shadow-lg shadow-[#00B5AD]/10">
                <GameController size={28} color="#00B5AD" weight="fill" />
              </View>
              <Text className="text-gray-300 text-sm font-semibold text-center">
                Library
              </Text>
            </View>
          </View>

          {/* Animated Circular Progress Bar */}
          <View className="items-center">
            {/* Circular Progress Container */}
            <View className="relative w-20 h-20 mb-6">
              {/* Background Circle */}
              <View className="absolute inset-0 rounded-full border-4 border-white/10" />
              
              {/* Animated Progress Circle */}
              <Animated.View 
                className="absolute inset-0 rounded-full border-4 border-transparent"
                style={{
                  borderTopColor: '#9146FF',
                  borderRightColor: '#9146FF',
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              />
              
              {/* Inner Content */}
              <View className="absolute inset-2 rounded-full bg-gradient-to-br from-[#9146FF]/10 to-[#9146FF]/5 justify-center items-center border border-[#9146FF]/20">
                <Animated.Text 
                  className="text-[#9146FF] font-bold text-xs"
                  style={{
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 0.1, 1],
                      outputRange: [0, 1, 1],
                    }),
                  }}
                >
                  {progress}%
                </Animated.Text>
              </View>
            </View>
            
            {/* Loading Text with enhanced styling */}
            <View className="flex-row items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Text className="text-gray-300 text-sm font-medium mr-3">
                Loading your gaming experience
              </Text>
              <View className="flex-row space-x-1">
                <View className="w-1.5 h-1.5 rounded-full bg-[#9146FF] opacity-80" />
                <View className="w-1.5 h-1.5 rounded-full bg-[#9146FF] opacity-60" />
                <View className="w-1.5 h-1.5 rounded-full bg-[#9146FF] opacity-40" />
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Bottom Branding */}
        <View className="absolute bottom-12 left-0 right-0 items-center">
          <View className="flex-row items-center bg-white/5 rounded-full px-4 py-2 border border-white/10">
            <Text className="text-gray-400 text-sm font-medium mr-2">
              Made with
            </Text>
            <Heart size={14} color="#FF6B6B" weight="fill" />
            <Text className="text-gray-400 text-sm font-medium ml-2">
              for Gamers
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
