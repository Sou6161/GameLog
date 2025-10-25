import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';

export function AuthScreen() {
  const { user, login, register, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const loggedInUser = user ? { name: user.username } : null;

  // No animated glow; keeping the background prominent and the UI clean

  const backgrounds = [
    'https://preview.redd.it/assassins-creed-shadow-key-art-v0-xs75tqogbn0d1.jpg?width=1080&crop=smart&auto=webp&s=83d6606f199ce0a2a1644c4e789fb56aea589f11',
    'https://www.ytechb.com/wp-content/uploads/2023/12/GTA-6-Wallpaper-1-YTECHB.webp',
    'https://wallpapers.com/images/hd/god-of-war-ragnarok-fierce-battle-4w87svqna0kscg9k.jpg',
    'https://i.pinimg.com/736x/b3/12/3b/b3123b9bf6acc15205794996b0fc2659.jpg',
    'https://img1.wallspic.com/previews/6/1/0/4/7/174016/174016-cyberpunk_2077-johnny_silverhand-cyberpunk_edgerunners-cyberpunk-building-500x.jpg',
    'https://i.pinimg.com/736x/d2/95/e8/d295e8e12d8bb09e97bf98b9b082f047.jpg',
    'https://www.chromethemer.com/wallpapers/phone/images/640/last-of-us.png',
    'https://i.pinimg.com/736x/5d/0d/0a/5d0d0a137a41d7c312a06598c98d8359.jpg',
  ];

  // Double-buffered crossfade (two persistent layers, no unmounting)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [src0, setSrc0] = useState(backgrounds[0]);
  const [src1, setSrc1] = useState(backgrounds[1]);
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const opacity0 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const targetLayerRef = useRef<0 | 1>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const candidate = (currentIndex + 1) % backgrounds.length;
      setNextIndex(candidate);
      const target = activeLayer === 0 ? 1 : 0;
      targetLayerRef.current = target;
      const nextUri = backgrounds[candidate];
      if (target === 0) {
        setSrc0(nextUri);
      } else {
        setSrc1(nextUri);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [backgrounds, currentIndex, activeLayer]);

  const handleLoaded = (layer: 0 | 1) => {
    if (layer !== targetLayerRef.current) return;
    const fadeIn = layer === 0 ? opacity0 : opacity1;
    const fadeOut = layer === 0 ? opacity1 : opacity0;
    fadeIn.setValue(0);
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(fadeOut, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start(() => {
      setActiveLayer(layer);
      setCurrentIndex(nextIndex);
      // Prefetch one ahead, fire and forget
      const ahead = (nextIndex + 1) % backgrounds.length;
      try { (global as any).Image?.prefetch?.(backgrounds[ahead]); } catch {}
    });
  };

  // Minimal infinite title animation (gentle pulse)
  const titleOpacityRef = useRef(new Animated.Value(1));
  const titleScaleRef = useRef(new Animated.Value(1));
  // Tubelight glow animation for accent line
  const glowPulse = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(titleOpacityRef.current, { toValue: 0.9, duration: 1400, useNativeDriver: true }),
          Animated.timing(titleOpacityRef.current, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(titleScaleRef.current, { toValue: 1.02, duration: 1400, useNativeDriver: true }),
          Animated.timing(titleScaleRef.current, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, []);

  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.75, duration: 800, useNativeDriver: true }),
        // subtle quick flickers to emulate a tube light shimmer
        Animated.timing(glowPulse, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [glowPulse]);

  return (
    <View className="flex-1">
      {/* Layer 0 */}
      <Animated.Image
        source={{ uri: src0 }}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: opacity0 }}
        onLoad={() => handleLoaded(0)}
        resizeMode="cover"
        blurRadius={0.5}
      />
      {/* Layer 1 */}
      <Animated.Image
        source={{ uri: src1 }}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: opacity1 }}
        onLoad={() => handleLoaded(1)}
        resizeMode="cover"
        blurRadius={0.5}
      />
      {/* Twitch-themed overlays */}
      <View pointerEvents="none" className="absolute inset-0 bg-[#0E0E10]/20" />
      {/* Bottom Twitch purple fade */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(14,14,16,0.9)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute left-0 right-0 bottom-0 h-[35%]"
      />
      <LinearGradient
        colors={["rgba(14,14,16,0.1)", "rgba(14,14,16,0.8)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} className="flex-1 p-5 justify-center" keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) as number}>
        <ScrollView contentContainerStyle={{ justifyContent: 'center', paddingBottom: 24, flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="mb-[18px] items-center">
            <Animated.Text
              className="font-[Audiowide_400Regular] text-[36px] text-white"
              style={[
                {
                  opacity: titleOpacityRef.current ?? 1,
                  transform: [{ scale: titleScaleRef.current ?? 1 }],
                } as any,
              ]}
            >
              GameLog
            </Animated.Text>
            <Text className="mt-2 text-[#A0A0A0] font-medium">{loggedInUser ? `Welcome back, ${loggedInUser.name}` : 'Track • Discover • Share'}</Text>
          </View>

      <View className="bg-[#18181B] rounded-2xl p-[18px] border border-purple-500 shadow-2xl mx-0.5 mb-2">
          <TextInput
            className="bg-[#0E0E10] border border-[#3F3F46] rounded-xl py-[14px] px-[14px] mb-3 text-white font-normal"
            placeholder="Email"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            className="bg-[#0E0E10] border border-[#3F3F46] rounded-xl py-[14px] px-[14px] mb-3 text-white font-normal"
            placeholder="Password"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
          {!isLogin && (
            <TextInput
              className="bg-[#0E0E10] border border-[#3F3F46] rounded-xl py-[14px] px-[14px] mb-3 text-white font-normal"
              placeholder="Name (for sign up)"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={(text) => setName(text)}
            />
          )}

          <LinearGradient colors={["#9146FF", "#7C3AED"]} start={{x:0,y:0}} end={{x:1,y:1}} className="rounded-[14px] overflow-hidden shadow-xl">
            <TouchableOpacity
              className="py-[14px] items-center"
              onPress={() => (isLogin ? login(email, password) : register(email, password, name))}
            >
            <Text className="text-white font-bold text-sm tracking-wider">{isLogin ? 'Sign In' : 'Create Account'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity className="mt-4 items-center" onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-[#9146FF] font-medium">
              {isLogin ? "Don't have an account? Create an account" : 'Already have an account? Sign in here'}
            </Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
