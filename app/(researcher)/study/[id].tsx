import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { Applicant } from '@/types';
import { theme } from '@/theme';

type ApplicantTab = 'Eligible' | 'Booked' | 'Rejected';
const applicantTabs: ApplicantTab[] = ['Eligible', 'Booked', 'Rejected'];

function returnToMyStudies() {
  router.replace('/(researcher)');
}

function firstNameLabel(applicant: Applicant) {
  return applicant.name.split(' ')[0] || applicant.name;
}

export default function ResearcherStudyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { applicants: allApplicants, markResearcherStudyRead, studies } = useRole();
  const [activeTab, setActiveTab] = useState<ApplicantTab>('Eligible');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const study = studies.find((entry) => entry.id === id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Pressable onPress={returnToMyStudies} hitSlop={10} style={styles.backLink} accessibilityRole="button" accessibilityLabel="Back to My Studies">
          <Text style={styles.backText}>← {study?.title ?? 'My Studies'}</Text>
        </Pressable>
      )
    });
  }, [navigation, study?.title]);

  useFocusEffect(
    useCallback(() => {
      if (id) markResearcherStudyRead(id);
    }, [id, markResearcherStudyRead])
  );

  const applicants = useMemo(() => allApplicants.filter((entry) => entry.studyId === id), [allApplicants, id]);
  const tabApplicants = applicants.filter((entry) => entry.status === activeTab);

  if (!study) {
    return <EmptyState title="Study not found" subtitle="This study may have been deleted." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={study.title} />
      <Card>
        <Pressable onPress={() => setDetailsOpen((current) => !current)} style={styles.rowBetween} accessibilityRole="button">
          <Text style={styles.heading}>Study details {detailsOpen ? '⌃' : '⌄'}</Text>
          <Ionicons name={detailsOpen ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.primaryDark} />
        </Pressable>
        {detailsOpen ? (
          <>
            <Text style={styles.text}>{study.details}</Text>
            <Text style={styles.text}>Reward: {study.rewardKind} · {study.reward}</Text>
            <Text style={styles.text}>Duration: {study.durationMins} min · {study.locationKind}: {study.location}</Text>
            <Text style={styles.text}>Eligibility: {study.eligibilitySummary}</Text>
          </>
        ) : null}
      </Card>

      <View style={styles.tabs}>{applicantTabs.map((tab) => <FilterChip key={tab} label={tab} active={activeTab === tab} onPress={() => setActiveTab(tab)} />)}</View>
      {tabApplicants.length === 0 ? (
        <EmptyState title={`No ${activeTab.toLowerCase()} participants`} subtitle="Automated screening results will appear here without exposing raw answers." />
      ) : (
        tabApplicants.map((applicant, index) => {
          const canMessage = applicant.status === 'Booked' || applicant.status === 'Eligible';
          return (
            <Card key={applicant.id}>
              <View style={styles.rowBetween}>
                <Badge label={applicant.status} />
                {applicant.isNew ? <Badge label="New" /> : null}
              </View>
              <Text style={styles.title}>{firstNameLabel(applicant)}</Text>
              {canMessage ? (
                <>
                  <Text style={styles.text}>Age: {applicant.age}</Text>
                  <Text style={styles.text}>{applicant.summary}</Text>
                  <Pressable onPress={() => router.push(`/(researcher)/chat/${study.id}`)} style={styles.chatButton} accessibilityRole="button">
                    <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primaryDark} />
                    <Text style={styles.chatText}>Message {firstNameLabel(applicant)}</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.text}>Minimum necessary view: rejected outcome only. Raw demographic, behavioral, and health answers stay hidden.</Text>
              )}
              {applicant.status === 'Rejected' ? <Text style={styles.securityText}>Rejection must map to a locked eligibility criterion or a verifiable scheduling conflict.</Text> : null}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: theme.typography.body },
  heading: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  securityText: { color: theme.colors.primaryDark, lineHeight: 20, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  chatButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, alignSelf: 'flex-start', backgroundColor: '#EAF9F2', borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  chatText: { color: theme.colors.primaryDark, fontWeight: '800' }
});
