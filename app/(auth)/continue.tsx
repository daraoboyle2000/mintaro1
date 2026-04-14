import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ContinueScreen() {
  const { role } = useRole();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Continue to Mintaro"
        subtitle="Authentication is mocked in this alpha."
      />
      <View style={styles.box}>
        <Text style={styles.text}>Selected role: {role ?? 'none'}</Text>
        <Text style={styles.subtext}>Tap below to enter the app shell.</Text>
      </View>
      <Button
        title="Continue"
        onPress={() =>
          router.replace(role === 'researcher' ? '/(researcher)' : '/(participant)')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background
  },
  box: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm
  },
  text: {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  subtext: {
    color: theme.colors.textSecondary
  }
});
