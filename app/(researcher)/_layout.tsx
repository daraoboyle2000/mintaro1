import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateIcon } from '@/components/icons/tab/CreateIcon';
import { DashboardIcon } from '@/components/icons/tab/DashboardIcon';
import { ProfileIcon } from '@/components/icons/tab/ProfileIcon';
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
          tabBarIcon: ({ color }) => <DashboardIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="create-study"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <CreateIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
