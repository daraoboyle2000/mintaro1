import { ScrollView, StyleSheet, Text } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockApplicants, mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function ApplicantsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Study Applicants" subtitle="Review and manage incoming applications" />
      {mockApplicants.length === 0 ? (
        <EmptyState title="No applicants yet" subtitle="Share your study to start receiving applications." />
      ) : (
        mockApplicants.map((applicant) => {
          const studyTitle = mockStudies.find((study) => study.id === applicant.studyId)?.title;
          return (
            <Card key={applicant.id}>
              <Badge label={applicant.status} />
              <Text style={styles.title}>{applicant.name}</Text>
              <Text style={styles.text}>Age: {applicant.age}</Text>
              <Text style={styles.text}>Study: {studyTitle ?? 'Unknown'}</Text>
              <Text style={styles.text}>{applicant.summary}</Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary }
});
