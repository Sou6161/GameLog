import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Heart } from 'phosphor-react-native';

interface FeedItem {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  game: {
    title: string;
    coverUrl: string;
  };
  action: string;
  rating?: number;
  timeAgo: string;
}

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.action}>
            {item.action} <Text style={styles.gameTitle}>{item.game.title}</Text>
          </Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Image source={{ uri: item.game.coverUrl }} style={styles.gameCover} />
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{item.game.title}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" weight="fill" />
              <Text style={styles.rating}>{item.rating}/10</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={20} color="#94A3B8" weight="bold" />
          <Text style={styles.actionText}>12</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#22D3EE',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#E2E8F0',
  },
  action: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  timeAgo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  gameTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#22D3EE',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 4,
  },
});