import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';

interface Game {
  id: string;
  title: string;
  coverUrl: string;
  rating: number;
  genre: string;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: game.coverUrl }} style={styles.cover} />
        <View style={styles.ratingBadge}>
          <Star size={12} color="#F59E0B" weight="fill" />
          <Text style={styles.ratingText}>{game.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{game.title}</Text>
        <Text style={styles.genre}>{game.genre}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  cover: {
    width: 140,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(10, 15, 31, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 2,
  },
  info: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  genre: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
});