import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        <View style={styles.ratingBadge}>
          <Star size={12} color="#FFD700" weight="fill" />
          <Text style={styles.ratingText}>{game.rating}</Text>
        </View>
        <View style={styles.genreBadge}>
          <Text style={styles.genreBadgeText}>{game.genre}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{game.title}</Text>
        <View style={styles.metaInfo}>
          <View style={styles.ratingInfo}>
            <Star size={12} color="#FFD700" weight="fill" />
            <Text style={styles.ratingInfoText}>{game.rating}</Text>
          </View>
        </View>
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
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cover: {
    width: 140,
    height: 200,
    borderRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#FFD700',
    marginLeft: 3,
  },
  genreBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 210, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D2FF',
  },
  genreBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#000000',
  },
  info: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingInfoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFD700',
  },
  genre: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#00D2FF',
  },
});