import React from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, ActivityIndicator, Dimensions, Linking, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowsOut, ArrowsIn, YoutubeLogo } from 'phosphor-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { colors } from '@/constants/theme';

export type PlayerMedia =
  | { type: 'youtube'; id: string; title: string }
  | { type: 'twitch'; channel: string; title: string };

interface Props {
  media: PlayerMedia | null;
  onClose: () => void;
}

// The Twitch embed player validates the `parent` query param against the page
// origin. In a WebView we set the HTML `baseUrl` to the same host so it matches.
const TWITCH_PARENT = 'gamelog.app';

function twitchHtml(channel: string) {
  // The iframe must fill the WebView. A percentage height only resolves against
  // a parent that HAS a height, so html/body need an explicit 100% — otherwise
  // the player collapses to its intrinsic size and floats in a black box.
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
      html, body {
        margin: 0; padding: 0;
        width: 100%; height: 100%;
        background: #000; overflow: hidden;
      }
      iframe {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        border: 0; display: block;
      }
    </style></head>
    <body>
      <iframe
        src="https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${TWITCH_PARENT}&autoplay=true&muted=false&playsinline=true"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowfullscreen scrolling="no">
      </iframe>
    </body></html>`;
}

// Runtime orientation control (guarded so it no-ops if the native module isn't
// in the current build yet — the app still works, fullscreen just won't rotate).
async function lockLandscape() {
  try {
    const SO = await import('expo-screen-orientation');
    await SO.lockAsync(SO.OrientationLock.LANDSCAPE);
  } catch {}
}
async function lockPortrait() {
  try {
    const SO = await import('expo-screen-orientation');
    await SO.lockAsync(SO.OrientationLock.PORTRAIT_UP);
  } catch {}
}

export default function MediaPlayerModal({ media, onClose }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [win, setWin] = React.useState(() => Dimensions.get('window'));

  React.useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWin(window));
    return () => sub.remove();
  }, []);

  // Reset when the media changes.
  React.useEffect(() => {
    setLoading(true);
    setFullscreen(false);
  }, [media]);

  // Always restore portrait when the player unmounts.
  React.useEffect(() => {
    return () => {
      lockPortrait();
    };
  }, []);

  const toggleFullscreen = () => {
    setFullscreen((f) => {
      const next = !f;
      if (next) lockLandscape();
      else lockPortrait();
      return next;
    });
  };

  const handleClose = () => {
    if (fullscreen) lockPortrait();
    setFullscreen(false);
    onClose();
  };

  // Largest 16:9 rectangle that fits within the given bounds (so the video AND
  // YouTube's control bar always fit on screen — no scrolling).
  const fit16x9 = (maxW: number, maxH: number) => {
    let w = maxW;
    let h = Math.round((w * 9) / 16);
    if (h > maxH) {
      h = maxH;
      w = Math.round((h * 16) / 9);
    }
    return { w, h };
  };

  // Windowed: fit to width. Fullscreen: fit to the whole (landscape) screen.
  const size = fullscreen
    ? fit16x9(win.width, win.height)
    : fit16x9(win.width, Math.round((win.width * 9) / 16));
  const winW = size.w;
  const winH = size.h;

  const renderPlayer = (w: number, h: number) => {
    if (!media) return null;
    if (media.type === 'youtube') {
      if (Platform.OS === 'web') {
        return (
          // @ts-ignore — iframe is valid on web
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${media.id}?autoplay=1&playsinline=1&modestbranding=1&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }
      return (
        <YoutubePlayer
          key={media.id}
          height={h}
          width={w}
          play
          videoId={media.id}
          initialPlayerParams={{ modestbranding: true, rel: false, preventFullScreen: true }}
          onReady={() => setLoading(false)}
          webViewProps={{ scrollEnabled: false }}
        />
      );
    }
    // twitch
    if (Platform.OS === 'web') {
      return (
        // @ts-ignore — iframe is valid on web
        <iframe
          width="100%"
          height="100%"
          src={`https://player.twitch.tv/?channel=${media.channel}&parent=localhost&autoplay=true`}
          frameBorder="0"
          allowFullScreen
        />
      );
    }
    return (
      <WebView
        key={`${media.channel}-${w}x${h}`} // re-layout the embed when the size changes (e.g. fullscreen)
        source={{ html: twitchHtml(media.channel), baseUrl: `https://${TWITCH_PARENT}` }}
        style={{ width: w, height: h, backgroundColor: '#000' }}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        scrollEnabled={false}
        bounces={false}
        // Our CSS already sizes the iframe to 100%; letting Android rescale the
        // page on top of that is what shrinks the player.
        scalesPageToFit={false}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
      />
    );
  };

  const FsButton = () => (
    <TouchableOpacity
      onPress={toggleFullscreen}
      className="w-10 h-10 rounded-full justify-center items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      {fullscreen ? <ArrowsIn size={18} color="#FFFFFF" weight="bold" /> : <ArrowsOut size={18} color="#FFFFFF" weight="bold" />}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={!!media}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <StatusBar hidden />
      <SafeAreaProvider>
      <View className="flex-1" style={{ backgroundColor: '#000' }}>
        {fullscreen ? (
          // ---------- Fullscreen: device is in landscape, fit 16:9 to the screen ----------
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#000' }}>
            <View style={{ width: winW, height: winH, backgroundColor: '#000' }}>
              {renderPlayer(winW, winH)}
            </View>
            {/* Exit button kept clear of the status bar / nav bar / notch */}
            <SafeAreaView edges={['top', 'right', 'left', 'bottom']} style={{ position: 'absolute', top: 0, right: 0 }}>
              <View style={{ padding: 14 }}><FsButton /></View>
            </SafeAreaView>
          </View>
        ) : (
          // ---------- Windowed (centered, YouTube-app size) ----------
          <View className="flex-1 justify-center">
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-12 pb-3 z-10">
              <Text className="flex-1 text-base font-bold mr-3 text-white" numberOfLines={1}>{media?.title || 'Player'}</Text>
              <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <X size={18} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>

            {/* Player */}
            <View style={{ width: winW, height: winH, backgroundColor: '#000', alignSelf: 'center' }}>
              {renderPlayer(winW, winH)}
              {loading && (
                <View className="absolute inset-0 justify-center items-center">
                  <ActivityIndicator size="large" color={colors.teal} />
                </View>
              )}
              <View className="absolute bottom-2 right-2"><FsButton /></View>
            </View>

            {/* Footer: open-in-app fallback (e.g. age-restricted videos) */}
            {media?.type === 'youtube' && (
              <View className="absolute bottom-0 left-0 right-0 items-center pb-10">
                <TouchableOpacity
                  onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${media.id}`)}
                  className="flex-row items-center px-4 py-2.5 rounded-full"
                  style={{ backgroundColor: colors.elevated }}
                >
                  <YoutubeLogo size={18} color="#FF0000" weight="fill" />
                  <Text className="text-white font-semibold ml-2 text-sm">Open in YouTube</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      </SafeAreaProvider>
    </Modal>
  );
}
