// @ts-nocheck
import * as React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { House, Compass, Plus, ListBullets, User } from 'phosphor-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 8);
  const tabBarHeight = Platform.OS === 'web' ? 90 : 70 + bottomInset; // base height + safe area

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopColor: '#3F3F46',
          borderTopWidth: 1,
          paddingBottom: bottomInset,
          paddingTop: 8,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#9146FF',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#9146FF',
        tabBarInactiveTintColor: '#9CA3AF',
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