import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameController } from 'phosphor-react-native';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <View className="px-5 py-4 border-b border-[#3F3F46] bg-[#0E0E10]">
      <View className="flex-row items-center justify-center gap-2.5">
        <View className="w-8 h-8 rounded-2xl bg-[rgba(145,70,255,0.1)] justify-center items-center">
          <GameController size={20} color="#9146FF" weight="fill" />
        </View>
        <Text className="font-semibold text-xl text-[#F1F5F9] text-center">{title}</Text>
      </View>
    </View>
  );
}
