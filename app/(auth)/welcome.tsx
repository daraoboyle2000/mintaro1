import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { Role } from '@/types';
import { theme } from '@/theme';

export default function WelcomeScreen() {
  const { setRole } = useRole();

  const chooseRole = (nextRole: Role) => {
    setRole(nextRole);
    router.replace(nextRole === 'researcher' ? '/(researcher)' : '/(participant)');
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Welcome to Mintaro"
        subtitle="Find paid research studies or recruit the perfect participants."
      />
      <View style={styles.roleBlock}>
        <Button title="I'm a Participant" onPress={() => chooseRole('participant')} />
        <Button
          title="I'm a Researcher"
          variant="secondary"
          onPress={() => chooseRole('researcher')}
        />
      </View>
      <Text style={styles.note}>You can change your role later in profile settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.background
  },
  roleBlock: {
    gap: theme.spacing.md
  },
  note: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption
  }
});
