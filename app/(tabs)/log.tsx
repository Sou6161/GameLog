import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameController, Clock, Star } from 'phosphor-react-native';
import { Header } from '@/components/Header';
import { LogForm } from '@/components/LogForm';

export default function LogScreen() {
  const [selectedStatus, setSelectedStatus] = useState<string>('playing');

  const statusOptions = [
    { id: 'playing', label: 'Playing', icon: GameController, color: '#22D3EE' },
    { id: 'completed', label: 'Completed', icon: Star, color: '#22C55E' },
    { id: 'backlog', label: 'Backlog', icon: Clock, color: '#F59E0B' },
    { id: 'dropped', label: 'Dropped', icon: Star, color: '#EF4444' },
  ];

  return (
    <LinearGradient
      colors={['#0A0F1F', '#111827']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Log Session" />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>What are you playing?</Text>
            
            {/* Status Selection */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedStatus === option.id;
                  
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.statusOption,
                        isSelected && styles.statusOptionSelected,
                        { borderColor: option.color }
                      ]}
                      onPress={() => setSelectedStatus(option.id)}
                    >
                      <IconComponent 
                        size={24} 
                        color={isSelected ? option.color : '#94A3B8'} 
                        weight="bold" 
                      />
                      <Text 
                        style={[
                          styles.statusOptionText,
                          { color: isSelected ? option.color : '#94A3B8' }
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <LogForm selectedStatus={selectedStatus} />
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
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    backgroundColor: '#22334A',
  },
  statusOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: 8,
  },
});