import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateIcon } from '@/components/icons/tab/CreateIcon';
import { MyStudiesIcon } from '@/components/icons/tab/MyStudiesIcon';
import { ProfileIcon } from '@/components/icons/tab/ProfileIcon';
import { theme } from '@/theme';

export default function ResearcherLayout() {
  const insets = useSafeAreaInsets();
  const iconSize = 24;

  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
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
          title: 'My Studies',
          tabBarIcon: ({ color }) => <MyStudiesIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen
        name="create-study"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <CreateIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen name="applicants" options={{ href: null, title: 'My Studies', headerTitle: '' }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon size={iconSize} color={color} />
        }}
      />
      <Tabs.Screen name="study/[id]" options={{ href: null, title: 'My Studies', headerTitle: '', headerLeft: () => <Ionicons name="library" size={22} color={theme.colors.primaryDark} /> }} />
      <Tabs.Screen name="chat/[studyId]" options={{ href: null, title: 'My Studies', headerTitle: '', headerLeft: () => <Ionicons name="library" size={22} color={theme.colors.primaryDark} /> }} />
    </Tabs>
  );
}
