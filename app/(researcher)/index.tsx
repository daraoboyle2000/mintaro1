import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ResearcherMyStudiesScreen() {
  const { applicants: allApplicants, studies, unreadResearcherUpdatesCount } = useRole();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Open a study to manage eligibility results, booking, and participant chats." />
      {unreadResearcherUpdatesCount > 0 ? <View style={styles.counter}><Text style={styles.counterText}>{unreadResearcherUpdatesCount} new participant update{unreadResearcherUpdatesCount === 1 ? '' : 's'}</Text></View> : null}
      {studies.length === 0 ? (
        <EmptyState title="No studies yet" subtitle="Create your first study to start matching eligible participants." />
      ) : (
        studies.map((study) => {
          const applicants = allApplicants.filter((entry) => entry.studyId === study.id);
          const eligible = applicants.filter((entry) => entry.status === 'Eligible').length;
          const booked = applicants.filter((entry) => entry.status === 'Booked').length;
          const rejected = applicants.filter((entry) => entry.status === 'Rejected').length;
          const unread = applicants.reduce((sum, entry) => sum + (entry.unreadUpdates ?? (entry.isNew ? 1 : 0)), 0);
          const active = study.isActive !== false;
          return (
            <Pressable key={study.id} onPress={() => router.push(`/(researcher)/study/${study.id}`)} accessibilityRole="button">
              <Card>
                <View style={styles.rowBetween}>
                  <View style={styles.badges}><Badge label={active ? '● Live' : '○ Inactive'} /><Badge label={study.theme} /><Badge label={study.mode} /></View>
                  {unread > 0 ? <View style={styles.unreadBubble}><Text style={styles.unreadText}>{unread}</Text></View> : null}
                </View>
                <Text style={styles.title}>{study.title}</Text>
                <Text style={styles.text}>{study.reward} • {study.duration}</Text>
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
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  counter: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
  counterText: { color: '#B91C1C', fontWeight: '800' },
  unreadBubble: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontWeight: '800' },
});
