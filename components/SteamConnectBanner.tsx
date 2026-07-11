import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { GameController, X, ArrowRight } from 'phosphor-react-native';
import { colors, glow, alpha } from '@/constants/theme';
import { SteamService } from '@/services/steamService';

const DISMISS_KEY = '@gamelog_steam_banner_dismissed';

// One-time prompt on Home introducing the Steam import. Hides itself once the
// user connects Steam or dismisses it.
export default function SteamConnectBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dismissed, status] = await Promise.all([
          AsyncStorage.getItem(DISMISS_KEY),
          SteamService.getStatus().catch(() => null),
        ]);
        if (cancelled) return;
        // Only pitch it to people who haven't connected and haven't dismissed.
        setVisible(!dismissed && !!status && !status.connected);
      } catch {
        // Never let the banner break the home screen.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = async () => {
    setVisible(false);
    try {
      await AsyncStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  if (!visible) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/steam' as any)}
      className="rounded-2xl p-4 mb-6 flex-row items-center"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: alpha(colors.blue, 0.5),
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3.5"
        style={{ backgroundColor: colors.blue, ...glow(colors.blue, 0.45, 14) }}
      >
        <GameController size={24} color={colors.void} weight="fill" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="font-bold text-base" style={{ color: colors.text }}>
            Import your Steam library
          </Text>
          <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: alpha(colors.lime, 0.18) }}>
            <Text className="text-[10px] font-bold" style={{ color: colors.lime }}>NEW</Text>
          </View>
        </View>
        <Text className="text-xs mt-1 leading-4" style={{ color: colors.textMuted }}>
          Connect once — every game you own and your playtime import automatically.
        </Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-xs font-bold" style={{ color: colors.tealBright }}>Connect Steam</Text>
          <ArrowRight size={12} color={colors.tealBright} weight="bold" style={{ marginLeft: 4 }} />
        </View>
      </View>

      <TouchableOpacity
        onPress={dismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="w-7 h-7 rounded-full items-center justify-center ml-2"
        style={{ backgroundColor: colors.elevated }}
      >
        <X size={13} color={colors.textMuted} weight="bold" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
