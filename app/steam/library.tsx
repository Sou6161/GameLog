import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, MagnifyingGlass, GameController, Clock, SortAscending, CaretRight } from 'phosphor-react-native';
import { colors, gradients, alpha, glow } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { formatPlaytime } from '@/lib/format';

type SortKey = 'playtime' | 'name';

// Steam-imported games live in their own view, separate from the manual library.
// They're still real IGDB games underneath, so tapping one opens the normal game
// detail screen where the user can review it.
export default function SteamLibraryScreen() {
  const libraryGames = useGameStore((s) => s.libraryGames);
  const libraryLoading = useGameStore((s) => s.libraryLoading);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('playtime');

  const games = useMemo(() => {
    const steamOnly = libraryGames.filter((g) => g.source === 'steam');
    const q = search.trim().toLowerCase();
    const filtered = q ? steamOnly.filter((g) => g.title.toLowerCase().includes(q)) : steamOnly;
    return [...filtered].sort((a, b) =>
      sort === 'playtime'
        ? (b.steamPlaytimeMinutes || 0) - (a.steamPlaytimeMinutes || 0)
        : a.title.localeCompare(b.title)
    );
  }, [libraryGames, search, sort]);

  const totalHours = useMemo(
    () =>
      Math.round(
        libraryGames
          .filter((g) => g.source === 'steam')
          .reduce((sum, g) => sum + (g.steamPlaytimeMinutes || 0), 0) / 60
      ),
    [libraryGames]
  );
  const steamCount = libraryGames.filter((g) => g.source === 'steam').length;

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-3 pb-3">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.push('/steam' as any))}
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <ArrowLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <View className="ml-3">
            <Text className="font-bold text-xl" style={{ color: colors.text }}>Steam Games</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {steamCount} imported · {totalHours.toLocaleString()}h played
            </Text>
          </View>
        </View>

        {/* Search + sort */}
        <View className="px-5 pb-3">
          <View
            className="flex-row items-center rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <MagnifyingGlass size={18} color={colors.textMuted} weight="bold" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your Steam games..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 text-base ml-2.5"
              style={{ color: colors.text }}
            />
          </View>

          <View className="flex-row items-center mt-3 gap-2">
            <SortAscending size={15} color={colors.textMuted} weight="bold" />
            {(['playtime', 'name'] as SortKey[]).map((key) => {
              const active = sort === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSort(key)}
                  className="px-3 py-1.5 rounded-full"
                  style={
                    active
                      ? { backgroundColor: alpha(colors.blue, 0.18), borderWidth: 1, borderColor: alpha(colors.blue, 0.5) }
                      : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
                  }
                >
                  <Text className="text-xs font-bold" style={{ color: active ? colors.blue : colors.textMuted }}>
                    {key === 'playtime' ? 'Most played' : 'A–Z'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {libraryLoading && steamCount === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        ) : steamCount === 0 ? (
          <View className="flex-1 justify-center items-center px-10">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: alpha(colors.blue, 0.14) }}>
              <GameController size={30} color={colors.blue} weight="fill" />
            </View>
            <Text
              className="font-bold text-lg mb-1.5"
              style={{ color: colors.text, alignSelf: 'stretch', textAlign: 'center' }}
            >
              No Steam games yet
            </Text>
            <Text
              className="text-sm mb-5"
              style={{ color: colors.textMuted, alignSelf: 'stretch', textAlign: 'center' }}
            >
              Connect Steam and sync to import your library.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/steam' as any)}
              className="px-5 py-3 rounded-2xl"
              style={{ backgroundColor: colors.blue, ...glow(colors.blue, 0.35, 12) }}
            >
              <Text className="font-bold" style={{ color: colors.void }}>Go to Steam</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                activeOpacity={0.85}
                // Steam games are matched to IGDB, so this opens the real game
                // detail screen — where the user can review it like any other game.
                onPress={() => router.push(`/game/${game.id}`)}
                className="flex-row items-center rounded-2xl p-3 mb-3"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                {game.coverUrl ? (
                  <Image source={{ uri: game.coverUrl }} className="w-14 h-20 rounded-xl mr-3" />
                ) : (
                  <View className="w-14 h-20 rounded-xl mr-3 items-center justify-center" style={{ backgroundColor: colors.elevated }}>
                    <GameController size={20} color={colors.textMuted} />
                  </View>
                )}

                <View className="flex-1">
                  <Text className="font-semibold text-base" style={{ color: colors.text }} numberOfLines={2}>
                    {game.title}
                  </Text>
                  {!!game.genre && (
                    <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }} numberOfLines={1}>
                      {game.genre}
                    </Text>
                  )}
                  <View
                    className="flex-row items-center mt-1.5 self-start px-2 py-1 rounded-full"
                    style={{ backgroundColor: alpha(colors.blue, 0.16), flexShrink: 0 }}
                  >
                    <Clock size={11} color={colors.blue} weight="fill" />
                    <Text
                      className="text-[11px] font-semibold ml-1"
                      numberOfLines={1}
                      style={{ color: colors.blue, flexShrink: 0, paddingRight: 2 }}
                    >
                      {formatPlaytime(game.steamPlaytimeMinutes)}
                    </Text>
                  </View>
                </View>

                <CaretRight size={18} color={colors.textMuted} weight="bold" />
              </TouchableOpacity>
            ))}

            {games.length === 0 && (
              <Text className="text-center mt-8" style={{ color: colors.textMuted }}>
                No games match “{search}”.
              </Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
