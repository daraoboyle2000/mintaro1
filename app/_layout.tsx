import { Stack } from 'expo-router';

import { RoleProvider } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function RootLayout() {
  return (
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
        <Stack.Screen name="study/[id]" options={{ title: 'Study details' }} />
      </Stack>
    </RoleProvider>
  );
}
