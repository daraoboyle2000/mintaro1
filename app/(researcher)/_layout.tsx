import { Image } from 'react-native';
import { Tabs } from 'expo-router';

import { theme } from '@/theme';

export default function ResearcherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size }) => (
            <Image source={require('../../assets/icons/tab-dashboard.png')} style={{ width: size, height: size }} />
          )
        }}
      />
      <Tabs.Screen
        name="create-study"
        options={{
          title: 'Create',
          tabBarIcon: ({ size }) => (
            <Image source={require('../../assets/icons/tab-create.png')} style={{ width: size, height: size }} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size }) => (
            <Image
              source={require('../../assets/icons/tab-profile-researcher.png')}
              style={{ width: size, height: size }}
            />
          )
        }}
      />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
