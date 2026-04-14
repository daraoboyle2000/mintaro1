import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { theme } from '@/theme';

const fieldPlaceholders = [
  'Study title',
  'Summary',
  'Reward amount',
  'Duration',
  'Location or remote',
  'Eligibility requirements'
];

export default function CreateStudyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Create Study" subtitle="Publish a new listing in minutes" />
      <Card>
        <View style={styles.fields}>
          {fieldPlaceholders.map((placeholder) => (
            <TextInput key={placeholder} placeholder={placeholder} style={styles.input} />
          ))}
        </View>
      </Card>
      <Text style={styles.note}>Publishing is mocked in this alpha release.</Text>
      <Button title="Publish study" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  fields: { gap: theme.spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#fff'
  },
  note: { color: theme.colors.textSecondary }
});
