import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ListBullets, Star } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { ListCard } from '@/components/ListCard';

const mockLists = [
  {
    id: '1',
    name: 'Favorite RPGs',
    description: 'My all-time favorite role-playing games',
    itemCount: 12,
    coverUrls: [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=150&h=200&fit=crop',
      'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=150&h=200&fit=crop',
      'https://images.pexels.com/photos/163036/mario-luigi-figures-funny-163036.jpeg?auto=compress&cs=tinysrgb&w=150&h=200&fit=crop',
    ],
    isRanked: true,
  },
  {
    id: '2',
    name: 'Backlog 2024',
    description: 'Games I want to play this year',
    itemCount: 24,
    coverUrls: [
      'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=150&h=200&fit=crop',
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=150&h=200&fit=crop',
    ],
    isRanked: false,
  },
];

export default function ListsScreen() {
  return (
    <LinearGradient
      colors={['#0A0F1F', '#111827']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="My Lists" />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Create New List Button */}
            <TouchableOpacity style={styles.createButton}>
              <LinearGradient
                colors={['#22D3EE', '#0EA5E9']}
                style={styles.createButtonGradient}
              >
                <Plus size={24} color="#0A0F1F" weight="bold" />
                <Text style={styles.createButtonText}>Create New List</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Lists */}
            <View style={styles.listsContainer}>
              {mockLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
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
  createButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#0A0F1F',
    marginLeft: 8,
  },
  listsContainer: {
    gap: 16,
  },
});