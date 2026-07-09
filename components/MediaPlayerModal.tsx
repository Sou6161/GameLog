import React from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, ActivityIndicator, Dimensions, Linking, StatusBar } from 'react-native';
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
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></head>
    <body style="margin:0;background:#000;overflow:hidden">
      <iframe
        src="https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${TWITCH_PARENT}&autoplay=true&muted=false"
        height="100%" width="100%" frameborder="0" scrolling="no" allowfullscreen="true">
      </iframe>
    </body></html>`;
}

export default function MediaPlayerModal({ media, onClose }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [dims, setDims] = React.useState(() => Dimensions.get('window'));

  // Track rotations/resizes so the fullscreen math stays correct.
  React.useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDims(window));
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setFullscreen(false);
  }, [media]);

  const SW = dims.width;
  const SH = dims.height;
  // Windowed player: full width, 16:9.
  const winW = SW;
  const winH = Math.round((SW * 9) / 16);

  const handleClose = () => {
    setFullscreen(false);
    onClose();
  };

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
          key={`${media.id}-${w}x${h}`}
          height={h}
          width={w}
          play
          videoId={media.id}
          initialPlayerParams={{ modestbranding: true, rel: false, preventFullScreen: true }}
          onReady={() => setLoading(false)}
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
        source={{ html: twitchHtml(media.channel), baseUrl: `https://${TWITCH_PARENT}` }}
        style={{ flex: 1, backgroundColor: '#000' }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
      />
    );
  };

  // A small control button.
  const CtrlButton = ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      {children}
    </TouchableOpacity>
  );

  const fullscreenBtn = (
    <TouchableOpacity
      onPress={() => setFullscreen((f) => !f)}
      className="w-9 h-9 rounded-full justify-center items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      {fullscreen ? <ArrowsIn size={18} color="#FFFFFF" weight="bold" /> : <ArrowsOut size={18} color="#FFFFFF" weight="bold" />}
    </TouchableOpacity>
  );

  return (
    <Modal visible={!!media} transparent={false} animationType="fade" onRequestClose={handleClose} supportedOrientations={['portrait', 'landscape']}>
      <StatusBar hidden={fullscreen} />
      <View className="flex-1" style={{ backgroundColor: '#000' }}>
        {!fullscreen ? (
          // ---------- Windowed (centered, YouTube-app size) ----------
          <View className="flex-1 justify-center">
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-12 pb-3 z-10">
              <Text className="flex-1 text-base font-bold mr-3 text-white" numberOfLines={1}>{media?.title || 'Player'}</Text>
              <CtrlButton onPress={handleClose}>
                <X size={18} color="#FFFFFF" weight="bold" />
              </CtrlButton>
            </View>

            {/* Player */}
            <View style={{ width: winW, height: winH, backgroundColor: '#000', alignSelf: 'center' }}>
              {renderPlayer(winW, winH)}
              {loading && (
                <View className="absolute inset-0 justify-center items-center">
                  <ActivityIndicator size="large" color={colors.teal} />
                </View>
              )}
              {/* Fullscreen toggle (bottom-right over the player) */}
              <View className="absolute bottom-2 right-2">{fullscreenBtn}</View>
            </View>

            {/* Footer: open-in-app fallback (e.g. age-restricted videos) */}
            <View className="absolute bottom-0 left-0 right-0 items-center pb-10">
              {media?.type === 'youtube' && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${media.id}`)}
                  className="flex-row items-center px-4 py-2.5 rounded-full"
                  style={{ backgroundColor: colors.elevated }}
                >
                  <YoutubeLogo size={18} color="#FF0000" weight="fill" />
                  <Text className="text-white font-semibold ml-2 text-sm">Open in YouTube</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          // ---------- Fullscreen (rotated to landscape) ----------
          <View className="flex-1" style={{ backgroundColor: '#000' }}>
            <View
              style={{
                position: 'absolute',
                width: SH,
                height: SW,
                top: (SH - SW) / 2,
                left: (SW - SH) / 2,
                transform: [{ rotate: '90deg' }],
                backgroundColor: '#000',
              }}
            >
              {renderPlayer(SH, SW)}
              {/* Exit fullscreen (top-right of the rotated view) */}
              <View style={{ position: 'absolute', top: 12, right: 12 }}>{fullscreenBtn}</View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
