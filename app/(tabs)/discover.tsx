import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, TrendingUp, Fire } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';

const mockTrendingGames = [
  {
    id: '1',
    title: 'Baldur\'s Gate 3',
    coverUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    rating: 9.6,
    genre: 'RPG',
  },
  {
    id: '2',
    title: 'Spider-Man 2',
    coverUrl: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    rating: 8.8,
    genre: 'Action',
  },
  {
    id: '3',
    title: 'Alan Wake 2',
    coverUrl: 'https://images.pexels.com/photos/163036/mario-luigi-figures-funny-163036.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
    rating: 9.1,
    genre: 'Horror',
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <LinearGradient
      colors={['#0A0F1F', '#111827']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Discover" />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search games..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Trending Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={24} color="#22D3EE" weight="bold" />
                <Text style={styles.sectionTitle}>Trending Now</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {mockTrendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>

            {/* New Releases */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Fire size={24} color="#F43F5E" weight="bold" />
                <Text style={styles.sectionTitle}>New Releases</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {mockTrendingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#E2E8F0',
    marginLeft: 8,
  },
  horizontalScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
});