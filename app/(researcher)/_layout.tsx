import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

export default function ResearcherLayout() {
  const insets = useSafeAreaInsets();
  const iconSize = 24;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10)
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="create-study"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
