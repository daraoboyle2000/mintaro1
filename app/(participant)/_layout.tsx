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
        tabBarStyle: { backgroundColor: '#fff', height: 70, paddingTop: 6, paddingBottom: 8 },
        tabBarIconStyle: { marginTop: 2 }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: () => (
            <Image source={require('../../assets/icons/tab-browse.png')} style={{ width: 30, height: 30, backgroundColor: '#fff' }} />
          )
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'My Studies',
          tabBarBadge: unreadMyStudiesCount > 0 ? `+${unreadMyStudiesCount}` : undefined,
          tabBarIcon: () => (
            <Image source={require('../../assets/icons/tab-my-studies.png')} style={{ width: 30, height: 30, backgroundColor: '#fff' }} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => (
            <Image source={require('../../assets/icons/tab-profile.png')} style={{ width: 30, height: 30, backgroundColor: '#fff' }} />
          )
        }}
      />
      <Tabs.Screen name="chat/[studyId]" options={{ href: null }} />
      <Tabs.Screen name="study/[id]" options={{ href: null }} />
    </Tabs>
  );
}
