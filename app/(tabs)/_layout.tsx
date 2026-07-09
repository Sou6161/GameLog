// @ts-nocheck
import * as React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Compass, Plus, ListBullets, User } from 'phosphor-react-native';
import { colors, glow } from '@/constants/theme';

// Active tabs sit in a solid glowing pill; inactive icons are muted.
function TabIcon({ Icon, focused }: { Icon: any; focused: boolean }) {
  if (focused) {
    return (
      <View
        style={{
          width: 46,
          height: 34,
          borderRadius: 17,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.teal,
          ...glow(colors.teal, 0.7, 12),
        }}
      >
        <Icon size={22} color={colors.void} weight="fill" />
      </View>
    );
  }
  return (
    <View style={{ width: 46, height: 34, justifyContent: 'center', alignItems: 'center' }}>
      <Icon size={22} color={colors.textMuted} weight="bold" />
    </View>
  );
}

// Raised center "+" action button (solid).
function CenterButton({ focused }: { focused: boolean }) {
  return (
    <View
      style={{
        top: Platform.OS === 'web' ? -10 : -18,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg,
        padding: 4,
      }}
    >
      <View
        style={{
          flex: 1,
          alignSelf: 'stretch',
          borderRadius: 26,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: focused ? colors.orange : colors.coral,
          ...glow(colors.coral, 0.8, 16),
        }}
      >
        <Plus size={28} color={colors.void} weight="bold" />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 10);
  const tabBarHeight = Platform.OS === 'web' ? 84 : 66 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: bottomInset,
          paddingTop: 10,
          height: tabBarHeight,
          elevation: 24,
          shadowColor: colors.teal,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon Icon={House} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon Icon={Compass} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <CenterButton focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon Icon={ListBullets} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
