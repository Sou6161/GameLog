import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Compass, Plus, ListBullets, User } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
          backgroundColor: '#000000',
          borderTopColor: '#FF1493',
          borderTopWidth: 2,
          paddingBottom: bottomInset,
          paddingTop: 8,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#FF1493',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }: { size: number; color: string; focused: boolean }) => (
            <House 
              size={size} 
              color={color} 
              weight={focused ? "fill" : "bold"} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ size, color, focused }: { size: number; color: string; focused: boolean }) => (
            <Compass 
              size={size} 
              color={color} 
              weight={focused ? "fill" : "bold"} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarIcon: ({ size, color, focused }: { size: number; color: string; focused: boolean }) => (
            <Plus 
              size={size} 
              color={color} 
              weight={focused ? "fill" : "bold"} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ size, color, focused }: { size: number; color: string; focused: boolean }) => (
            <ListBullets 
              size={size} 
              color={color} 
              weight={focused ? "fill" : "bold"} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }: { size: number; color: string; focused: boolean }) => (
            <User 
              size={size} 
              color={color} 
              weight={focused ? "fill" : "bold"} 
            />
          ),
        }}
      />
    </Tabs>
  );
}