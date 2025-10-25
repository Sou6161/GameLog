import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Play, Users, Clock } from 'phosphor-react-native';
import { TwitchStream, TwitchUser } from '../services/twitchService';
import { twitchService } from '../services/twitchService';

interface LiveStreamCardProps {
  stream: TwitchStream;
  streamer?: TwitchUser;
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream, streamer }) => {
  const handleWatchStream = () => {
    const twitchUrl = `https://www.twitch.tv/${stream.user_name}`;
    Linking.openURL(twitchUrl);
  };

  const getThumbnailUrl = () => {
    if (!stream.thumbnail_url) {
      return 'https://via.placeholder.com/320x180/9146FF/FFFFFF?text=No+Preview';
    }
    
    // Replace template variables in thumbnail URL for better quality
    return stream.thumbnail_url
      .replace('{width}', '320')
      .replace('{height}', '180');
  };

  return (
    <TouchableOpacity
      onPress={handleWatchStream}
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2A2A3E',
      }}
      activeOpacity={0.8}
    >
      {/* Stream Thumbnail */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: getThumbnailUrl() }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
        
        {/* Live Badge */}
        <View style={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: '#EF4444',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{ width: 6, height: 6, backgroundColor: 'white', borderRadius: 3, marginRight: 4 }} />
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>LIVE</Text>
        </View>

        {/* Viewer Count */}
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Users size={12} color="white" />
          <Text style={{ color: 'white', fontSize: 10, marginLeft: 4 }}>
            {twitchService.formatViewerCount(stream.viewer_count)}
          </Text>
        </View>

        {/* Play Button Overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: 'rgba(0,210,255,0.9)',
            borderRadius: 25,
            padding: 12,
          }}>
            <Play size={24} color="#FFFFFF" weight="fill" />
          </View>
        </View>
      </View>

      {/* Stream Info */}
      <View style={{ padding: 16 }}>
        {/* Streamer Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {streamer?.profile_image_url ? (
            <Image
              source={{ uri: streamer.profile_image_url }}
              style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }}
            />
          ) : (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#9CA3AF',
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#374151', fontSize: 12, fontWeight: 'bold' }}>
                {stream.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              {streamer?.display_name || stream.user_name}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10 }}>
              {streamer?.view_count ? `${twitchService.formatViewerCount(streamer.view_count)} followers` : ''}
            </Text>
          </View>
        </View>

        {/* Stream Title */}
        <Text 
          style={{ color: 'white', fontSize: 14, fontWeight: '500', marginBottom: 8 }}
          numberOfLines={2}
        >
          {stream.title}
        </Text>

        {/* Stream Stats */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 10, marginLeft: 4 }}>
              {twitchService.formatStreamDuration(stream.started_at)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users size={14} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 10, marginLeft: 4 }}>
              {twitchService.formatViewerCount(stream.viewer_count)} watching
            </Text>
          </View>
        </View>

        {/* Language Badge */}
        {stream.language && stream.language !== 'en' && (
          <View style={{ marginTop: 8 }}>
            <View style={{
              backgroundColor: 'rgba(167,139,250,0.2)',
              borderWidth: 1,
              borderColor: 'rgba(167,139,250,0.4)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ color: '#A78BFA', fontSize: 10 }}>
                {stream.language.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
