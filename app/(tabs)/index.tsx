import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedCard } from '@/components/FeedCard';
import { Header } from '@/components/Header';
import { AppContent } from '@/components/AppContent';

const mockFeedData = [
  {
    id: '1',
    user: { username: 'GamerPro', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&crop=face' },
    game: { title: 'Cyberpunk 2077', coverUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop' },
    action: 'completed',
    rating: 8.5,
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    user: { username: 'RetroGamer', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&crop=face' },
    game: { title: 'The Witcher 3', coverUrl: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop' },
    action: 'reviewed',
    rating: 9.2,
    timeAgo: '4 hours ago',
  },
  {
    id: '3',
    user: { username: 'IndieExplorer', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&crop=face' },
    game: { title: 'Hades', coverUrl: 'https://images.pexels.com/photos/163036/mario-luigi-figures-funny-163036.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop' },
    action: 'started playing',
    timeAgo: '6 hours ago',
  },
];

function HomeContent() {
  return (
    <LinearGradient
      colors={['#0A0F1F', '#111827']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="GameLog" />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            {mockFeedData.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
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
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#22D3EE',
    marginBottom: 20,
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});