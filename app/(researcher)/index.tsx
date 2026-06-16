import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockApplicants } from '@/data/mockData';
import { theme } from '@/theme';

export default function ResearcherMyStudiesScreen() {
  const { studies, setRole, isParticipantSetupComplete } = useRole();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Open a study to manage eligibility results, booking, and participant chats." />
      <Button
        title="Switch to participant"
        variant="secondary"
        onPress={() => {
          setRole('participant');
          router.replace(isParticipantSetupComplete ? '/(participant)' : '/(auth)/setup');
        }}
      />
      {studies.length === 0 ? (
        <EmptyState title="No studies yet" subtitle="Create your first study to start matching eligible participants." />
      ) : (
        studies.map((study) => {
          const applicants = mockApplicants.filter((entry) => entry.studyId === study.id);
          const eligible = applicants.filter((entry) => entry.status === 'Eligible').length;
          const booked = applicants.filter((entry) => entry.status === 'Booked').length;
          const rejected = applicants.filter((entry) => entry.status === 'Rejected').length;
          return (
            <Pressable key={study.id} onPress={() => router.push(`/(researcher)/study/${study.id}`)} accessibilityRole="button">
              <Card>
                <View style={styles.rowBetween}>
                  <View style={styles.badges}><Badge label={study.theme} /><Badge label={study.mode} /></View>
                  <Text style={styles.openText}>Open study ›</Text>
                </View>
                <Text style={styles.title}>{study.title}</Text>
                <Text style={styles.text}>{study.reward} • {study.duration} • criteria locked: {study.criteriaLocked ? 'Yes' : 'On publish'}</Text>
                <View style={styles.statsRow}>
                  <Badge label={`${eligible} eligible`} />
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
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, flex: 1 },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  openText: { color: theme.colors.primaryDark, fontWeight: '800' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }
});
