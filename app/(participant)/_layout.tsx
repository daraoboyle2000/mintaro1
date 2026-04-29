import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ParticipantLayout() {
  const { unreadMyStudiesCount } = useRole();
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
        },
        tabBarIconStyle: { marginTop: 2 }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'My Studies',
          tabBarBadge: unreadMyStudiesCount > 0 ? `+${unreadMyStudiesCount}` : undefined,
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen name="chat/[studyId]" options={{ href: null }} />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
