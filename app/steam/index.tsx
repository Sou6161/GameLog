import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { router, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  ArrowsClockwise,
  CaretRight,
  CheckCircle,
  GameController,
  Lock,
  LinkBreak,
  Warning,
  X,
} from 'phosphor-react-native';
import { colors, gradients, glow, alpha } from '@/constants/theme';
import { SteamService, SteamStatus, SteamSyncResult, SteamUnmatchedGame } from '@/services/steamService';
import { ApiError } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { formatSyncTime } from '@/lib/format';

export default function SteamScreen() {
  const fetchLibrary = useGameStore((s) => s.fetchLibrary);
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  const [status, setStatus] = useState<SteamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [callbackPath, setCallbackPath] = useState('/api/steam/auth/callback');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SteamSyncResult | null>(null);
  const [unmatched, setUnmatched] = useState<SteamUnmatchedGame[]>([]);
  const [showUnmatched, setShowUnmatched] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await SteamService.getStatus());
    } catch (error) {
      console.error('Steam status failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const handleConnect = async () => {
    try {
      const { url, callbackPath: cb } = await SteamService.startAuth();
      setCallbackPath(cb);
      setAuthUrl(url);
    } catch (error) {
      showConfirmation(
        'Steam Unavailable',
        'Could not start Steam login. Make sure the server is reachable and try again.',
        () => {}, 'warning', 'OK', ''
      );
    }
  };

  // Steam redirects the WebView back to our callback once the user logs in.
  const handleNavChange = (navState: { url: string }) => {
    if (navState.url.includes(callbackPath)) {
      setAuthUrl(null);
      setTimeout(loadStatus, 400);
    }
  };

  const handleSync = async (force = false) => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await SteamService.sync(force);
      setResult(res);
      await Promise.all([loadStatus(), fetchLibrary()]);
      if (res.unmatched > 0) {
        setUnmatched(await SteamService.getUnmatched());
      }
    } catch (error) {
      // A 429 isn't a failure — it's our own cooldown. Steam playtime barely
      // changes minute to minute, but if the user explicitly wants a re-sync,
      // let them force it rather than dead-ending on an error.
      if (error instanceof ApiError && error.status === 429) {
        showConfirmation(
          'Already Up to Date',
          'Your Steam library was synced just now. Syncing again usually won’t change anything — but you can if you want.',
          () => handleSync(true),
          'info',
          'Sync Anyway',
          'Cancel'
        );
        return;
      }
      const message =
        error instanceof ApiError && error.message
          ? error.message
          : 'Failed to sync your Steam library. Please try again.';
      showConfirmation('Sync Failed', message, () => {}, 'warning', 'OK', '');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    showConfirmation(
      'Disconnect Steam',
      'This unlinks your Steam account and removes the games it imported. Manually added games and your reviews are kept.',
      async () => {
        try {
          await SteamService.disconnect();
          setResult(null);
          setUnmatched([]);
          await Promise.all([loadStatus(), fetchLibrary()]);
        } catch {
          showConfirmation('Error', 'Failed to disconnect Steam.', () => {}, 'warning', 'OK', '');
        }
      },
      'danger',
      'Disconnect',
      'Cancel'
    );
  };

  const connected = !!status?.connected;

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-3 pb-4">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))}
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <ArrowLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <Text className="font-bold text-xl ml-3" style={{ color: colors.text }}>Steam</Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        ) : (
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Hero */}
            <View className="rounded-3xl p-6 items-center mb-5" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <View className="w-20 h-20 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: colors.blue, ...glow(colors.blue, 0.45, 20) }}>
                <GameController size={38} color={colors.void} weight="fill" />
              </View>

              {connected ? (
                <>
                  {status?.avatar ? (
                    <Image source={{ uri: status.avatar }} className="w-14 h-14 rounded-full mb-2" style={{ borderWidth: 2, borderColor: colors.teal }} />
                  ) : null}
                  <View className="flex-row items-center mb-1">
                    <CheckCircle size={18} color={colors.green} weight="fill" />
                    <Text className="font-bold text-xl ml-2" style={{ color: colors.text, flexShrink: 1 }}>
                      Steam Connected
                    </Text>
                  </View>
                  <Text
                    className="text-sm px-4"
                    style={{ color: colors.textDim, alignSelf: 'stretch', textAlign: 'center' }}
                  >
                    {status?.persona || status?.steamId}
                  </Text>
                  {status?.lastSyncedAt && (
                    // A plain full-width centered Text — no pill, no flex row. Any
                    // shrink-wrapped container here gets measured narrow on Android
                    // and clips/ellipsizes the end of the string.
                    <Text
                      className="text-xs mt-2 px-2"
                      style={{ color: colors.textMuted, alignSelf: 'stretch', textAlign: 'center' }}
                    >
                      Last synced {formatSyncTime(status.lastSyncedAt)}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text
                    className="font-bold text-2xl mb-2"
                    style={{ color: colors.text, alignSelf: 'stretch', textAlign: 'center' }}
                  >
                    Import your Steam library
                  </Text>
                  <Text
                    className="text-sm leading-6"
                    style={{ color: colors.textDim, alignSelf: 'stretch', textAlign: 'center' }}
                  >
                    Connect once and every game you own — plus your playtime — is added to your GameLog library automatically. No manual logging.
                  </Text>
                </>
              )}
            </View>

            {/* Stats when connected */}
            {connected && (
              <View className="flex-row gap-3 mb-5">
                <View className="flex-1 items-center py-4 rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text className="font-bold text-2xl" style={{ color: colors.tealBright }}>{status?.importedCount ?? 0}</Text>
                  <Text
                    className="text-xs mt-0.5 px-2"
                    style={{ color: colors.textMuted, alignSelf: 'stretch', textAlign: 'center' }}
                  >
                    Games imported
                  </Text>
                </View>
                <View className="flex-1 items-center py-4 rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text className="font-bold text-2xl" style={{ color: colors.gold }}>{status?.unmatchedCount ?? 0}</Text>
                  <Text
                    className="text-xs mt-0.5 px-2"
                    style={{ color: colors.textMuted, alignSelf: 'stretch', textAlign: 'center' }}
                  >
                    Unmatched
                  </Text>
                </View>
              </View>
            )}

            {/* Sync result */}
            {result && (
              <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: alpha(colors.green, 0.1), borderWidth: 1, borderColor: alpha(colors.green, 0.4) }}>
                <View className="flex-row items-center mb-1.5">
                  <CheckCircle size={18} color={colors.green} weight="fill" />
                  <Text className="font-bold text-base ml-2" style={{ color: colors.green }}>Sync complete</Text>
                </View>
                <Text className="text-sm leading-5" style={{ color: colors.textDim }}>
                  Imported {result.imported} new {result.imported === 1 ? 'game' : 'games'}
                  {result.updated > 0 ? `, updated ${result.updated}` : ''} from {result.total} owned.
                  {result.skipped > 0
                    ? ` Skipped ${result.skipped} non-games (demos, tools, soundtracks).`
                    : ''}
                </Text>
                {result.unmatched > 0 && (
                  <TouchableOpacity onPress={() => setShowUnmatched(true)} className="mt-2.5 self-start">
                    <Text className="text-sm font-bold" style={{ color: colors.gold }}>
                      {result.unmatched} couldn't be matched — review
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Actions */}
            {connected ? (
              <>
                {/* Steam games get their own view, separate from the manual library. */}
                {(status?.importedCount ?? 0) > 0 && (
                  <TouchableOpacity
                    onPress={() => router.push('/steam/library' as any)}
                    activeOpacity={0.9}
                    className="rounded-2xl p-4 flex-row items-center mb-3"
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: alpha(colors.blue, 0.5) }}
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: alpha(colors.blue, 0.18) }}>
                      <GameController size={20} color={colors.blue} weight="fill" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-base" style={{ color: colors.text }}>View Steam Games</Text>
                      <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                        Browse and review your {status?.importedCount} imported games
                      </Text>
                    </View>
                    <CaretRight size={18} color={colors.textMuted} weight="bold" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleSync()}
                  disabled={syncing}
                  activeOpacity={0.9}
                  className="rounded-2xl p-4 flex-row items-center justify-center mb-3"
                  style={{ backgroundColor: colors.teal, opacity: syncing ? 0.7 : 1, ...glow(colors.teal, 0.4, 16) }}
                >
                  {syncing ? (
                    <ActivityIndicator color={colors.void} />
                  ) : (
                    <ArrowsClockwise size={20} color={colors.void} weight="bold" />
                  )}
                  <Text className="font-bold text-base ml-2" style={{ color: colors.void }}>
                    {syncing ? 'Importing your library…' : 'Sync Library'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDisconnect}
                  className="rounded-2xl p-4 flex-row items-center justify-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: alpha(colors.red, 0.4) }}
                >
                  <LinkBreak size={18} color={colors.red} weight="bold" />
                  <Text className="font-bold text-base ml-2" style={{ color: colors.red }}>Disconnect Steam</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleConnect}
                activeOpacity={0.9}
                className="rounded-2xl p-4 flex-row items-center justify-center"
                style={{ backgroundColor: colors.blue, ...glow(colors.blue, 0.4, 16) }}
              >
                <GameController size={20} color={colors.void} weight="fill" />
                <Text className="font-bold text-base ml-2" style={{ color: colors.void }}>Connect Steam</Text>
              </TouchableOpacity>
            )}

            {/* Privacy hint */}
            <View className="flex-row items-start mt-5 p-4 rounded-2xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Lock size={16} color={colors.textMuted} weight="fill" />
              <Text className="text-xs leading-5 ml-2.5 flex-1" style={{ color: colors.textMuted }}>
                We never see your Steam password — Steam handles the login. Your Steam profile's
                "Game details" must be set to Public for us to read your owned games.
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Steam login WebView */}
      <Modal visible={!!authUrl} animationType="slide" onRequestClose={() => setAuthUrl(null)}>
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'left', 'right', 'bottom']}>
          <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text className="font-bold text-base" style={{ color: colors.text }}>Sign in to Steam</Text>
            <TouchableOpacity
              onPress={() => setAuthUrl(null)}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <X size={18} color={colors.text} weight="bold" />
            </TouchableOpacity>
          </View>
          {authUrl && (
            <WebView
              source={{ uri: authUrl }}
              onNavigationStateChange={handleNavChange}
              startInLoadingState
              renderLoading={() => (
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
                  <ActivityIndicator size="large" color={colors.teal} />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Unmatched games */}
      <Modal visible={showUnmatched} animationType="slide" transparent onRequestClose={() => setShowUnmatched(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="rounded-t-3xl max-h-[75%]" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between px-5 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View className="flex-row items-center">
                <Warning size={18} color={colors.gold} weight="fill" />
                <Text className="font-bold text-lg ml-2" style={{ color: colors.text }}>Unmatched games</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUnmatched(false)} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.elevated }}>
                <X size={18} color={colors.text} weight="bold" />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-5 py-4">
              <Text className="text-sm mb-4 leading-5" style={{ color: colors.textMuted }}>
                These Steam games had no confident match in our game database (usually tools, betas, or
                very obscure titles). You can still add them manually by searching.
              </Text>
              {unmatched.map((g) => (
                <View key={g.steamAppId} className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text className="flex-1 text-base" style={{ color: colors.textDim }} numberOfLines={1}>{g.name}</Text>
                  {g.playtimeMinutes > 0 && (
                    <Text className="text-xs ml-3" style={{ color: colors.textMuted }}>
                      {Math.round(g.playtimeMinutes / 60)}h
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={confirmationState.visible}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        type={confirmationState.type}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
      />
    </LinearGradient>
  );
}
