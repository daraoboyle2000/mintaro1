import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockApplicants } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';
import { Applicant } from '@/types';
import { theme } from '@/theme';

type ApplicantTab = 'Eligible' | 'Booked' | 'Rejected';
const applicantTabs: ApplicantTab[] = ['Eligible', 'Booked', 'Rejected'];

function returnToMyStudies() {
  router.replace('/(researcher)');
}

function anonymizedLabel(applicant: Applicant, index: number) {
  return applicant.status === 'Booked' ? applicant.name : `Anonymous eligible participant ${index + 1}`;
}

export default function ResearcherStudyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { studies } = useRole();
  const [activeTab, setActiveTab] = useState<ApplicantTab>('Eligible');
  const study = studies.find((entry) => entry.id === id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Pressable onPress={returnToMyStudies} hitSlop={10} style={styles.backLink} accessibilityRole="button" accessibilityLabel="Back to My Studies">
          <Ionicons name="library" size={18} color={theme.colors.primaryDark} />
          <Text style={styles.backText}>My Studies</Text>
        </Pressable>
      )
    });
  }, [navigation]);

  const applicants = useMemo(() => mockApplicants.filter((entry) => entry.studyId === id), [id]);
  const tabApplicants = applicants.filter((entry) => entry.status === activeTab);

  if (!study) {
    return <EmptyState title="Study not found" subtitle="This study may have been deleted." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={study.title} subtitle="Manage automated eligibility, booking, and privacy-gated participant information." />
      <Card>
        <Text style={styles.heading}>Study controls</Text>
        <Text style={styles.text}>{study.details}</Text>
        <Text style={styles.text}>Reward: {study.rewardKind} · {study.reward}</Text>
        <Text style={styles.text}>Duration: {study.durationMins} min · {study.locationKind}: {study.location}</Text>
        <Text style={styles.text}>Eligibility: {study.eligibilitySummary}</Text>
        <Text style={styles.securityText}>Criteria are locked before recruitment. Researchers initially see only eligibility outcomes; sensitive answers are released after booking/enrolment.</Text>
      </Card>

      <View style={styles.tabs}>{applicantTabs.map((tab) => <FilterChip key={tab} label={tab} active={activeTab === tab} onPress={() => setActiveTab(tab)} />)}</View>
      {tabApplicants.length === 0 ? (
        <EmptyState title={`No ${activeTab.toLowerCase()} participants`} subtitle="Automated screening results will appear here without exposing raw answers." />
      ) : (
        tabApplicants.map((applicant, index) => {
          const booked = applicant.status === 'Booked';
          return (
            <Card key={applicant.id}>
              <View style={styles.rowBetween}>
                <Badge label={applicant.status} />
                {applicant.isNew ? <Badge label="New" /> : null}
              </View>
              <Text style={styles.title}>{anonymizedLabel(applicant, index)}</Text>
              {booked ? (
                <>
                  <Text style={styles.text}>Age: {applicant.age}</Text>
                  <Text style={styles.text}>{applicant.summary}</Text>
                  <Pressable onPress={() => router.push(`/(researcher)/chat/${study.id}`)} style={styles.chatButton} accessibilityRole="button">
                    <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primaryDark} />
                    <Text style={styles.chatText}>Open booked participant chat</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.text}>Minimum necessary view: eligible outcome only. Raw demographic, behavioral, and health answers stay hidden until booking.</Text>
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
