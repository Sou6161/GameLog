import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

interface StatCardProps {
  stat: Stat;
}

export function StatCard({ stat }: StatCardProps) {
  const IconComponent = stat.icon;
  
  return (
    <View style={[styles.container, { borderColor: stat.color }]}>
      <IconComponent size={24} color={stat.color} weight="bold" />
      <Text style={[styles.value, { color: stat.color }]}>{stat.value}</Text>
      <Text style={styles.label}>{stat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  value: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});