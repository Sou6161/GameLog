import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#22D3EE',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#22D3EE',
    textAlign: 'center',
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});