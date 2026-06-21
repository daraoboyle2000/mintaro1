import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';


function StudyStatusBadge({ study }: { study: { isActive?: boolean; isPublished?: boolean } }) {
  const unpublished = study.isPublished === false;
  const inactive = !unpublished && study.isActive === false;
  const label = unpublished ? 'Unpublished' : inactive ? 'Inactive' : 'Live';

  return (
    <View style={styles.statusBadge}>
      <View style={[styles.statusDot, unpublished ? styles.unpublishedDot : inactive ? styles.inactiveDot : styles.liveDot]} />
      <Text style={[styles.statusText, unpublished && styles.unpublishedText]}>{label}</Text>
    </View>
  );
}

export default function ResearcherMyStudiesScreen() {
  const { applicants: allApplicants, studies } = useRole();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Open a study to manage eligibility results, booking, and participant chats." />
      {studies.length === 0 ? (
        <EmptyState title="No studies yet" subtitle="Create your first study to start matching eligible participants." />
      ) : (
        studies.map((study) => {
          const applicants = allApplicants.filter((entry) => entry.studyId === study.id);
          const applied = applicants.filter((entry) => entry.status === 'Applied' || entry.status === 'Eligible').length;
          const booked = applicants.filter((entry) => entry.status === 'Booked').length;
          const rejected = applicants.filter((entry) => entry.status === 'Rejected').length;
          return (
            <Pressable key={study.id} onPress={() => router.push(`/(researcher)/study/${study.id}`)} accessibilityRole="button">
              <Card>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>{study.title}</Text>
                  <StudyStatusBadge study={study} />
                </View>
                <View style={styles.statsRow}>
                  <Badge label={`${applied} applied`} />
                  <Badge label={`${booked} booked`} />
                  <Badge label={`${rejected} rejected`} />
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#EAF9F2', borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.md, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  unpublishedDot: { backgroundColor: '#000' },
  inactiveDot: { backgroundColor: theme.colors.textSecondary },
  liveDot: { backgroundColor: theme.colors.primaryDark },
  statusText: { color: theme.colors.primaryDark, fontSize: theme.typography.caption, fontWeight: '600' },
  unpublishedText: { color: '#000' },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
