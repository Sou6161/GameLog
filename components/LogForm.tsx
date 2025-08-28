import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MagnifyingGlass, Clock, GameController } from 'phosphor-react-native';

interface LogFormProps {
  selectedStatus: string;
}

export function LogForm({ selectedStatus }: LogFormProps) {
  const [searchGame, setSearchGame] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.container}>
      {/* Game Search */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Search Game</Text>
        <View style={styles.searchContainer}>
          <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
          <TextInput
            style={styles.searchInput}
            placeholder="Type game name..."
            placeholderTextColor="#94A3B8"
            value={searchGame}
            onChangeText={setSearchGame}
          />
        </View>
      </View>

      {/* Hours Played */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hours Played</Text>
        <View style={styles.inputContainer}>
          <Clock size={20} color="#94A3B8" weight="bold" />
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#94A3B8"
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any thoughts or comments..."
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton}>
        <LinearGradient
          colors={['#22D3EE', '#0EA5E9']}
          style={styles.submitGradient}
        >
          <GameController size={24} color="#0A0F1F" weight="bold" />
          <Text style={styles.submitText}>Log Session</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    color: '#0A0F1F',
    marginLeft: 8,
  },
});