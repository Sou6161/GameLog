import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameController } from 'phosphor-react-native';

export function LoadingScreen() {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    
    pulse.start();
    
    return () => pulse.stop();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <LinearGradient
      colors={['#0A0F1F', '#22D3EE', '#F43F5E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
          <GameController size={80} color="#E2E8F0" weight="bold" />
        </Animated.View>
        
        <Text style={styles.title}>GameLog</Text>
        <Text style={styles.subtitle}>Track • Discover • Share</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
  },
  title: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 48,
    color: '#E2E8F0',
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 2,
  },
});