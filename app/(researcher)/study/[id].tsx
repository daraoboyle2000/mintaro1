import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockApplicants, mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function ResearcherStudyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const study = mockStudies.find((entry) => entry.id === id);

  if (!study) {
    return <EmptyState title="Study not found" subtitle="This study may have been deleted." />;
  }

  const applicants = mockApplicants.filter((entry) => entry.studyId === study.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={study.title} subtitle="Study info and applicants" />
      <Card>
        <Text style={styles.heading}>Study info</Text>
        <Text style={styles.text}>{study.details}</Text>
        <Text style={styles.text}>Reward: {study.reward}</Text>
        <Text style={styles.text}>Duration: {study.duration}</Text>
        <Text style={styles.text}>Location: {study.location}</Text>
        <Text style={styles.text}>Eligibility: {study.eligibilitySummary}</Text>
      </Card>

      <SectionHeader title="Applicants" subtitle="New applicants are labeled" />
      {applicants.length === 0 ? (
        <EmptyState title="No applicants yet" subtitle="Share your study to receive applications." />
      ) : (
        applicants.map((applicant) => (
          <Card key={applicant.id}>
            <View style={styles.rowBetween}>
              <Badge label={applicant.status} />
              {applicant.isNew ? <Badge label="New" /> : null}
            </View>
            <Text style={styles.title}>{applicant.name}</Text>
            <Text style={styles.text}>Age: {applicant.age}</Text>
            <Text style={styles.text}>{applicant.summary}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary }
});
