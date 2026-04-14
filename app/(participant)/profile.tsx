import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { theme } from '@/theme';

const profileRows = [
  ['Age', '29'],
  ['Sex', 'Female'],
  ['Location permission', 'Enabled'],
  ['Study preferences', 'Health, Fintech'],
  ['Notifications', 'Push + Email']
];

export default function ParticipantProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Your Profile" subtitle="Manage participant details and preferences" />
      <Card>
        {profileRows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>
      <Button title="Edit profile" />
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
