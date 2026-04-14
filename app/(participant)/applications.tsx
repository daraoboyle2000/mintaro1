import { ScrollView, StyleSheet, Text } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function ApplicationsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Track your submitted applications" />
      {mockStudies.slice(0, 2).map((study) => (
        <Card key={study.id}>
          <Badge label="Applied" />
          <Text style={styles.title}>{study.title}</Text>
          <Text style={styles.text}>Reward: {study.reward}</Text>
          <Text style={styles.text}>Status: Pending researcher review</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary }
});
