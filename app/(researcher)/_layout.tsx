import { Image } from 'react-native';
import { Tabs } from 'expo-router';

import { theme } from '@/theme';

export default function ResearcherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: '#fff', height: 70, paddingTop: 6, paddingBottom: 8 }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: () => (
            <Image source={require('../../assets/icons/tab-dashboard.png')} style={{ width: 30, height: 30, backgroundColor: '#fff' }} />
          )
        }}
      />
      <Tabs.Screen
        name="create-study"
        options={{
          title: 'Create',
          tabBarIcon: () => (
            <Image source={require('../../assets/icons/tab-create.png')} style={{ width: 30, height: 30, backgroundColor: '#fff' }} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => (
            <Image
              source={require('../../assets/icons/tab-profile-researcher.png')}
              style={{ width: 30, height: 30, backgroundColor: '#fff' }}
            />
          )
        }}
      />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
