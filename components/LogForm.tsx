import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
    <View className="flex-1">
      {/* Game Search */}
      <View className="mb-6">
        <Text className="font-medium text-base text-[#E2E8F0] mb-2">Search Game</Text>
        <View className="flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 border border-[#374151]">
          <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
          <TextInput
            className="flex-1 ml-3 text-[#E2E8F0] font-normal text-base"
            placeholder="Type game name..."
            placeholderTextColor="#94A3B8"
            value={searchGame}
            onChangeText={setSearchGame}
          />
        </View>
      </View>

      {/* Hours Played */}
      <View className="mb-6">
        <Text className="font-medium text-base text-[#E2E8F0] mb-2">Hours Played</Text>
        <View className="flex-row items-center bg-[#1A2238] rounded-xl px-4 py-3 border border-[#374151]">
          <Clock size={20} color="#94A3B8" weight="bold" />
          <TextInput
            className="flex-1 ml-3 text-[#E2E8F0] font-normal text-base"
            placeholder="0"
            placeholderTextColor="#94A3B8"
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Notes */}
      <View className="mb-6">
        <Text className="font-medium text-base text-[#E2E8F0] mb-2">Notes (Optional)</Text>
        <TextInput
          className="bg-[#1A2238] rounded-xl px-4 py-3 border border-[#374151] text-[#E2E8F0] font-normal text-base min-h-[100px]"
          placeholder="Any thoughts or comments..."
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity className="mt-8 rounded-xl overflow-hidden">
        <LinearGradient
          colors={['#22D3EE', '#0EA5E9']}
          className="flex-row items-center justify-center py-[18px] px-6"
        >
          <GameController size={24} color="#0A0F1F" weight="bold" />
          <Text className="font-bold text-lg text-[#0A0F1F] ml-2">Log Session</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
