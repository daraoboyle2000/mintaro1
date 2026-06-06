import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { RoleProvider } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function RootLayout() {
  return (
    <RoleProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoider}
      >
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
      </KeyboardAvoidingView>
    </RoleProvider>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 }
});
