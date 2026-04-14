import { Tabs } from 'expo-router';

import { theme } from '@/theme';

export default function ParticipantLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: '#fff' }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Browse' }} />
      <Tabs.Screen name="applications" options={{ title: 'My Studies' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
