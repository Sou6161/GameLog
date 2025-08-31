import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GameCard } from '@/components/GameCard';
import { Header } from '@/components/Header';
import AppContent from '@/components/AppContent';
import { Star, Play, Heart, TrendUp, GameController, Sparkle, Fire, Lightning } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

// Mock data for featured games
const featuredGames = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 8.5,
    genre: 'RPG',
    isNew: true,
  },
  {
    id: '2',
    title: 'Elden Ring',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 9.2,
    genre: 'Action RPG',
    isNew: false,
  },
  {
    id: '3',
    title: 'God of War Ragnarök',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 9.4,
    genre: 'Action Adventure',
    isNew: true,
  },
  {
    id: '4',
    title: 'The Witcher 3',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 9.0,
    genre: 'RPG',
    isNew: false,
  },
];

const trendingGames = [
  {
    id: '5',
    title: 'Baldur\'s Gate 3',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 9.6,
    genre: 'RPG',
  },
  {
    id: '6',
    title: 'Spider-Man 2',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.8,
    genre: 'Action Adventure',
  },
  {
    id: '7',
    title: 'Starfield',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 7.5,
    genre: 'RPG',
  },
];

const popularThisWeek = [
  {
    id: '8',
    title: 'Alan Wake 2',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    rating: 8.9,
    genre: 'Horror',
  },
  {
    id: '9',
    title: 'Mortal Kombat 1',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    rating: 8.2,
    genre: 'Fighting',
  },
  {
    id: '10',
    title: 'Assassin\'s Creed Mirage',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    rating: 7.8,
    genre: 'Action Adventure',
  },
];

function FeaturedGameCard({ game }: { game: any }) {
  return (
    <TouchableOpacity style={styles.featuredCard}>
      <Image source={{ uri: game.coverUrl }} style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.featuredOverlay}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredTopRow}>
            {game.isNew && (
              <View style={styles.newBadge}>
                <Sparkle size={10} color="#FFFFFF" weight="fill" />
                <Text style={styles.newText}>NEW</Text>
              </View>
            )}
            <View style={styles.featuredRatingBadge}>
              <Star size={12} color="#FFD700" weight="fill" />
              <Text style={styles.featuredRatingText}>{game.rating}</Text>
            </View>
          </View>
          
          <View style={styles.featuredBottomContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>{game.title}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.featuredGenreBadge}>
                <Text style={styles.featuredGenreText}>{game.genre}</Text>
              </View>
              <View style={styles.featuredRatingInfo}>
                <Star size={12} color="#FFD700" weight="fill" />
                <Text style={styles.featuredRatingInfoText}>{game.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, icon: Icon, onPress, color }: { title: string; icon: any; onPress?: () => void; color: string }) {
  return (
    <TouchableOpacity style={styles.sectionHeader} onPress={onPress}>
      <View style={styles.sectionTitleContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
          <Icon size={18} color={color} weight="fill" />
        </View>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <View style={[styles.arrowContainer, { backgroundColor: color + '20' }]}>
        <Text style={[styles.arrowText, { color }]}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

function HomeContent() {
  return (
    <LinearGradient
      colors={['#6c5ce7','black','#6c5ce7']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* <Header title="GameLog" /> */}
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Simple Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.welcomeSubtitle}>What are you playing today?</Text>
            </View>

            {/* Featured Games */}
            <View style={styles.section}>
              <SectionHeader title="Featured Games" icon={Heart} color="#FF6B6B" />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalContent}
              >
                {featuredGames.map((game) => (
                  <FeaturedGameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Trending Now */}
            <View style={styles.section}>
              <SectionHeader title="Trending Now" icon={Fire} color="#00D2FF" />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalContent}
              >
                {trendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Popular This Week */}
            <View style={styles.section}>
              <SectionHeader title="Popular This Week" icon={Lightning} color="#FFE66D" />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalContent}
              >
                {popularThisWeek.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FF6B6B20' }]}>
                <View style={styles.actionIcon}>
                  <Play size={20} color="#FF6B6B" weight="fill" />
                </View>
                <Text style={styles.actionText}>Log Game</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#00D2FF20' }]}>
                <View style={styles.actionIcon}>
                  <Star size={20} color="#00D2FF" weight="fill" />
                </View>
                <Text style={styles.actionText}>Rate Game</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFE66D20' }]}>
                <View style={styles.actionIcon}>
                  <Heart size={20} color="#FFE66D" weight="fill" />
                </View>
                <Text style={styles.actionText}>Wishlist</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  welcomeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#00D2FF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  horizontalScroll: {
    marginHorizontal: -20,
  },
  horizontalContent: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: width * 0.65,
    height: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  newText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  featuredRatingBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  featuredRatingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFD700',
    marginLeft: 3,
  },
  featuredBottomContent: {
    gap: 8,
  },
  featuredTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredGenreBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D2FF',
  },
  featuredGenreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#000000',
  },
  featuredRatingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredRatingInfoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFD700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});