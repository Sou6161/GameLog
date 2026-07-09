import React from 'react';
import { View, Text } from 'react-native';
import { GameController } from 'phosphor-react-native';
import { colors, glow } from '@/constants/theme';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <View
      className="px-5 py-4 flex-row items-center justify-center gap-2.5"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg }}
    >
      <View
        style={{ width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.teal, ...glow(colors.teal, 0.5, 10) }}
      >
        <GameController size={19} color={colors.void} weight="fill" />
      </View>
      <Text className="font-bold text-xl" style={{ color: colors.text }}>{title}</Text>
    </View>
  );
}
