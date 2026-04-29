import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function StudyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applyToStudy } = useRole();
  const study = mockStudies.find((entry) => entry.id === id);

  if (!study) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Study not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={study.title} subtitle={study.shortDescription} />
      <Badge label={study.mode} />
      <Card>
        <Text style={styles.heading}>Study details</Text>
        <Text style={styles.text}>{study.details}</Text>
        <Text style={styles.text}>Reward: {study.reward}</Text>
        <Text style={styles.text}>Duration: {study.duration}</Text>
        <Text style={styles.text}>Location: {study.location}</Text>
        <Text style={styles.text}>Eligibility: {study.eligibilitySummary}</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>Tags</Text>
        <View style={styles.tags}>
          {study.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
      </Card>
      <Button title="Apply to this study" onPress={() => applyToStudy(study)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  missing: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missingText: { color: theme.colors.textSecondary },
  heading: { color: theme.colors.textPrimary, fontWeight: '700', fontSize: theme.typography.h3 },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }
});
