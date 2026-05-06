import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { APP_BUILD_LABEL, APP_LAST_UPDATED, APP_VERSION } from '@/config/appVersion';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function DevDebugScreen() {
  const { hydrateByPreset, role, setRole } = useRole();

  const continueAccount = () => {
    hydrateByPreset('account-made');
    const nextRole = role ?? 'participant';
    setRole(nextRole);
    router.replace(nextRole === 'participant' ? '/(participant)' : '/(researcher)');
  };

  const startFresh = () => {
    hydrateByPreset('fresh-account');
    setRole(null);
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Developer debug menu" subtitle="Choose startup account state for testing." />
      <View style={styles.actions}>
        <Button title="Account Made" onPress={continueAccount} />
        <Button title="Fresh Account" variant="secondary" onPress={startFresh} />
      </View>
      <Text style={styles.note}>Fresh account will show role selection. Account made opens dashboard directly.</Text>
      <View style={styles.versionBlock}>
        <Text style={styles.versionText}>Mintaro v{APP_VERSION}</Text>
        <Text style={styles.versionText}>{APP_BUILD_LABEL}</Text>
        <Text style={styles.versionText}>Last updated: {APP_LAST_UPDATED}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background
  },
  actions: { gap: theme.spacing.md },
  note: { color: theme.colors.textSecondary, textAlign: 'center' },
  versionBlock: { alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.md },
  versionText: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center' }
});
