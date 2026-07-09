import React from 'react';
import { View, Text } from 'react-native';
import { colors, glow, alpha } from '@/constants/theme';

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
    <View
      className="flex-1 min-w-[45%] rounded-[18px] p-4 items-center mb-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: alpha(stat.color, 0.35),
        ...glow(stat.color, 0.22, 12),
      }}
    >
      <View
        className="w-11 h-11 rounded-2xl justify-center items-center mb-2"
        style={{ backgroundColor: alpha(stat.color, 0.16), borderWidth: 1, borderColor: alpha(stat.color, 0.3) }}
      >
        <IconComponent size={22} color={stat.color} weight="fill" />
      </View>
      <Text className="font-bold text-2xl mb-0.5" style={{ color: stat.color }}>{stat.value}</Text>
      <Text className="font-medium text-xs text-center" style={{ color: colors.textMuted }}>{stat.label}</Text>
    </View>
  );
}
