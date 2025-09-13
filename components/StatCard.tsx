import React from 'react';
import { View, Text } from 'react-native';

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
    <View className="flex-1 min-w-[45%] bg-[#1A2238] rounded-xl p-4 items-center border-2 mb-3" style={{ borderColor: stat.color }}>
      <IconComponent size={24} color={stat.color} weight="bold" />
      <Text className="font-bold text-2xl mt-2 mb-1" style={{ color: stat.color }}>{stat.value}</Text>
      <Text className="font-normal text-xs text-[#94A3B8] text-center">{stat.label}</Text>
    </View>
  );
}
