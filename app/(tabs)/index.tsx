import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GameCard } from '@/components/GameCard';
import { Header } from '@/components/Header';
import AppContent from '@/components/AppContent';
import {
  Star,
  Play,
  Heart,
  TrendUp,
  GameController,
  Sparkle,
  Fire,
  Lightning,
  Crown,
  Trophy,
} from 'phosphor-react-native';

// Mock data for featured games
const featuredGames = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 8.5,
    genre: 'RPG',
    isNew: true,
    players: '1.2M',
    status: 'hot',
  },
  {
    id: '2',
    title: 'Elden Ring',
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 9.2,
    genre: 'Action RPG',
    isNew: false,
    players: '2.5M',
    status: 'trending',
  },
  {
    id: '3',
    title: 'God of War Ragnarök',
    coverUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 9.4,
    genre: 'Action Adventure',
    isNew: true,
    players: '3.1M',
    status: 'champion',
  },
  {
    id: '4',
    title: 'The Witcher 3',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 9.0,
    genre: 'RPG',
    isNew: false,
    players: '1.8M',
    status: 'classic',
  },
];

const trendingGames = [
  {
    id: '5',
    title: "Baldur's Gate 3",
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 9.6,
    genre: 'RPG',
  },
  {
    id: '6',
    title: 'Spider-Man 2',
    coverUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.8,
    genre: 'Action Adventure',
  },
  {
    id: '7',
    title: 'Starfield',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 7.5,
    genre: 'RPG',
  },
];

const popularThisWeek = [
  {
    id: '8',
    title: 'Alan Wake 2',
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 8.9,
    genre: 'Horror',
  },
  {
    id: '9',
    title: 'Mortal Kombat 1',
    coverUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.2,
    genre: 'Fighting',
  },
  {
    id: '10',
    title: "Assassin's Creed Mirage",
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 7.8,
    genre: 'Action Adventure',
  },
];

function FeaturedGameCard({ game }: { game: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return '#FF4757';
      case 'trending':
        return '#00D2FF';
      case 'champion':
        return '#FFD700';
      case 'classic':
        return '#A55EEA';
      default:
        return '#FF4757';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot':
        return Fire;
      case 'trending':
        return TrendUp;
      case 'champion':
        return Crown;
      case 'classic':
        return Trophy;
      default:
        return Fire;
    }
  };

  const StatusIcon = getStatusIcon(game.status);
  const statusColor = getStatusColor(game.status);

  return (
    <TouchableOpacity
      className="w-[280px] h-[360px] mr-5 relative "
      activeOpacity={0.9}
    >
      {/* Animated border glow */}
      <View
        className={`absolute -top-.5 -left-1.5 -right-1.5 -bottom-1.5 rounded-[22px] shadow-lg`}
        style={{
          shadowColor: statusColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
        }}
      />

      {/* Main card container */}
      <View className="flex-1 rounded-3xl overflow-hidden bg-[#1A1A2E] border-2 border-white/20">
        <Image
          source={{ uri: game.coverUrl }}
          className="w-full h-full absolute"
          
        />

        {/* Cyber grid overlay */}
        <View
          className="absolute inset-0 bg-transparent opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 210, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 210, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Multiple gradient layers for depth */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.98)']}
          className="absolute bottom-0 left-0 right-0 h-[65%] justify-end p-5"
        />

        {/* Neon accent line */}
        <View
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            backgroundColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 8,
          }}
        />

        <View className="flex-1 justify-between z-10">
          {/* Top badges row */}
          <View className="flex-row justify-between items-start px-2 pt-2">
            <View className="flex-row gap-1.5  ">
              {game.isNew && (
                <View
                  className="flex-row items-center px-2.5 py-1 rounded-[12px] gap-1 border-2 bg-[rgba(255,107,107,0.9)] border-[#FF6B6B]"
                  style={{
                    shadowColor: '#FF6B6B',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 7,
                  }}
                >
                  <Sparkle size={10} color="#FFFFFF" weight="fill" />
                  <Text className="font-bold text-xs text-white tracking-wide">
                    NEW
                  </Text>
                </View>
              )}
            </View>
            <View
              className="flex-row items-center px-2.5 py-1 rounded-[12px] gap-1 border-2"
              style={{
                backgroundColor: statusColor + '20',
                borderColor: statusColor,
                shadowColor: statusColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 7,
              }}
            >
              <StatusIcon size={10} color={statusColor} weight="fill" />
              <Text
                className="font-bold text-xs tracking-wide"
                style={{ color: statusColor }}
              >
                {game.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Bottom content */}
          <View className="gap-3 ml-2">
            <Text
              className="font-bold text-2xl text-white leading-7 shadow-text tracking-wide mb-1"
              numberOfLines={2}
            >
              {game.title}
            </Text>

            <View className="gap-2">
              <View className="flex-row justify-between items-center ml-2 mr-2">
                <View
                  className={`px-3 py-2 rounded-xl border-2 border-opacity-60 shadow-sm`}
                  style={{
                    backgroundColor: statusColor + '20',
                    borderColor: statusColor + '60',
                    shadowColor: statusColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 5,
                  }}
                >
                  <Text
                    style={{ color: statusColor }}
                    className="font-bold text-xs tracking-wide"
                  >
                    {game.genre}
                  </Text>
                </View>

                <View className="items-end">
                  <View
                    className="bg-black/90 rounded-xl px-3 py-2 flex-row items-center border-2 border-[#FFD700] shadow-md"
                    style={{
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.7,
                      shadowRadius: 7,
                    }}
                  >
                    <Star size={12} color="#FFD700" weight="fill" />
                    <Text className="font-bold text-xs text-[#FFD700] ml-1.5">
                      {game.rating}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar for rating */}
              <View className="mt-2">
                <View className="h-[5px] bg-white/20 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full shadow-md"
                    style={{
                      width: `${(game.rating / 10) * 100}%`,
                      backgroundColor: statusColor,
                      shadowColor: statusColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 5,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Corner decorations */}
        <View
          className="absolute top-3 left-3 w-7 h-7 border-3 border-r-0 border-b-0 rounded-tl-xl"
          style={{
            borderColor: statusColor,
            shadowColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
        <View
          className="absolute bottom-3 right-3 w-7 h-7 border-3 border-l-0 border-t-0 rounded-br-xl"
          style={{
            borderColor: statusColor,
            shadowColor: statusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  onPress,
  color,
}: {
  title: string;
  icon: any;
  onPress?: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center mb-5"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-9 h-9 rounded-[18px] justify-center items-center border border-white/10 shadow-lg"
          style={{
            backgroundColor: color + '20',
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Icon size={18} color={color} weight="fill" />
        </View>
        <View>
          <Text style={{ color }} className="font-bold text-xl">
            {title}
          </Text>
          <View
            style={{ backgroundColor: color }}
            className="h-0.5 w-[60%] mt-0.5 rounded-sm"
          />
        </View>
      </View>
      <TouchableOpacity
        style={{ backgroundColor: color + '15', borderColor: color + '30' }}
        className="w-8 h-8 rounded-2xl justify-center items-center border"
      >
        <Text style={{ color }} className="font-semibold text-base">
          →
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function HomeContent() {
  return (
    <LinearGradient
      colors={['#0F0F1F', '#121631', '#0A2342']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Enhanced Welcome Section */}
            <View className="mb-8 py-5 relative overflow-hidden">
              <Text className="font-bold text-[28px] text-white mb-1.5 flex-row items-center">
                Welcome back,{' '}
                <Text className="text-[#00D2FF] shadow-neon-blue">Gamer</Text>
              </Text>
              <Text className="font-normal text-base text-[#A0A0A0] mb-5">
                Ready to level up your gaming experience?
              </Text>
            </View>

            {/* Featured Games */}
            <View className="mb-8">
              <SectionHeader
                title="Featured Games"
                icon={Heart}
                color="#FF6B6B"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {featuredGames.map((game) => (
                  <FeaturedGameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Trending Now */}
            <View className="mb-8">
              <SectionHeader title="Trending Now" icon={Fire} color="#00D2FF" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {trendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Popular This Week */}
            <View className="mb-8">
              <SectionHeader
                title="Popular This Week"
                icon={Lightning}
                color="#FFE66D"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {popularThisWeek.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Enhanced Quick Actions */}
            <View className="flex-row justify-between mt-6 mb-10 gap-3">
              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#FF6B6B15]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#FF6B6B20]">
                  <Play size={20} color="#FF6B6B" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Log Game
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Track your progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#00D2FF15]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#00D2FF20]">
                  <Star size={20} color="#00D2FF" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Rate Game
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Share your review
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center p-5 rounded-2xl border border-white/10 relative overflow-hidden bg-[#FFE66D15]"
                activeOpacity={0.8}
              >
                <View className="absolute -top-12 -left-12 -right-12 -bottom-12 bg-white/[0.02] rounded-[50px]" />
                <View className="w-12 h-12 rounded-3xl justify-center items-center mb-3 border border-white/10 bg-[#FFE66D20]">
                  <Heart size={20} color="#FFE66D" weight="fill" />
                </View>
                <Text className="font-semibold text-xs text-white text-center mb-1">
                  Wishlist
                </Text>
                <Text className="font-normal text-[9px] text-[#A0A0A0] text-center">
                  Save for later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  return (
    <AppContent>
      <HomeContent />
    </AppContent>
  );
}
