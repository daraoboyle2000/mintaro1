import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

const rows = [
  ['Lab / Company', 'Northstar Research'],
  ['Focus Areas', 'Healthcare UX, Fintech'],
  ['Default payout method', 'Placeholder'],
  ['Notifications', 'Email only']
];

export default function ResearcherProfileScreen() {
  const { setRole } = useRole();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Researcher Profile" subtitle="Keep your workspace preferences up to date" />
      <Card>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>
      <Button title="Edit profile" />
      <Button title="Switch to participant view" variant="secondary" onPress={() => setRole('participant')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  label: { color: theme.colors.textSecondary },
  value: { color: theme.colors.textPrimary, fontWeight: '600' }
});
