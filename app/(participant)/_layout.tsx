import { Image } from 'react-native';
import { Tabs } from 'expo-router';

import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ParticipantLayout() {
  const { unreadMyStudiesCount } = useRole();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: '#fff' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ size }) => (
            <Image source={require('../../assets/icons/tab-browse.png')} style={{ width: size, height: size }} />
          )
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'My Studies',
          tabBarBadge: unreadMyStudiesCount > 0 ? `+${unreadMyStudiesCount}` : undefined,
          tabBarIcon: ({ size }) => (
            <Image source={require('../../assets/icons/tab-my-studies.png')} style={{ width: size, height: size }} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size }) => (
            <Image source={require('../../assets/icons/tab-profile.png')} style={{ width: size, height: size }} />
          )
        }}
      />
      <Tabs.Screen name="chat/[studyId]" options={{ href: null }} />
    </Tabs>
  );
}
