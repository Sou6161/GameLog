import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Compass, Plus, ListBullets, User } from 'phosphor-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomInset; // base height + safe area

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#22D3EE',
          borderTopWidth: 1,
          paddingBottom: bottomInset,
          paddingTop: 8,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: '#22D3EE',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <House size={size} color={color} weight="bold" />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ size, color }) => (
            <Compass size={size} color={color} weight="bold" />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} weight="bold" />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ size, color }) => (
            <ListBullets size={size} color={color} weight="bold" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} weight="bold" />
          ),
        }}
      />
    </Tabs>
  );
}