import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameController } from 'phosphor-react-native';

export function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationStarted = useRef(false);

  useEffect(() => {
    // Prevent animation from running multiple times
    if (animationStarted.current) return;
    animationStarted.current = true;

    // Initial entrance animation
    const entrance = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    // Glow effect after entrance
    const glow = Animated.timing(glowAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    });

    // Subtle pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 1 }
    );

    // Start animations in sequence
    entrance.start(() => {
      glow.start();
      pulse.start();
    });

    return () => {
      entrance.stop();
      glow.stop();
      pulse.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={['#6c5ce7', '#000000']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20],
              }),
            }
          ]}
        >
          <GameController size={80} color="#FFFFFF" weight="fill" />
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>GameLog</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.subtitleContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.subtitle}>Track • Discover • Share</Text>
        </Animated.View>
      </Animated.View>
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
    marginBottom: 32,
    padding: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#865EF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 48,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 2,
  },
});