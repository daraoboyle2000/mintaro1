import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RoleProvider } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RoleProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(participant)" options={{ headerShown: false }} />
        <Stack.Screen name="(researcher)" options={{ headerShown: false }} />
        <Stack.Screen name="study/[id]" options={{ headerTitle: '', headerLeft: () => <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Ionicons name="search" size={18} color={theme.colors.primaryDark} /><Text style={{ color: theme.colors.primaryDark, fontWeight: '800' }}>Browse studies</Text></Pressable> }} />
      </Stack>
      </RoleProvider>
    </GestureHandlerRootView>
  );
}
