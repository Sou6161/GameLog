import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { GameController, CheckCircle, CaretRight } from 'phosphor-react-native';
import { colors, glow, alpha } from '@/constants/theme';
import { SteamService, SteamStatus } from '@/services/steamService';

// The permanent home for the Steam feature (the Home banner is dismissible, so
// this is how users find it afterwards).
export default function SteamConnectionCard() {
  const [status, setStatus] = useState<SteamStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      SteamService.getStatus()
        .then((s) => !cancelled && setStatus(s))
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const connected = !!status?.connected;

  return (
    <View className="mb-8">
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.blue }} />
        <Text className="font-bold text-lg" style={{ color: colors.text }}>Connections</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/steam' as any)}
        className="flex-row items-center p-4 rounded-2xl"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: connected ? alpha(colors.blue, 0.18) : colors.blue, ...(connected ? {} : glow(colors.blue, 0.35, 12)) }}
        >
          <GameController size={21} color={connected ? colors.blue : colors.void} weight="fill" />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-base" style={{ color: colors.text }}>Steam</Text>
          {connected ? (
            <View className="flex-row items-center mt-0.5">
              <CheckCircle size={12} color={colors.green} weight="fill" />
              <Text className="text-sm ml-1" style={{ color: colors.textMuted }}>
                {status?.importedCount ?? 0} games imported
              </Text>
            </View>
          ) : (
            <Text className="text-sm mt-0.5" style={{ color: colors.textMuted }}>
              Import your library automatically
            </Text>
          )}
        </View>

        <CaretRight size={18} color={colors.textMuted} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}
