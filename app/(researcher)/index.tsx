import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockApplicants } from '@/data/mockData';
import { useRole } from '@/context/RoleContext';
import { Applicant } from '@/types';
import { theme } from '@/theme';

type ApplicantTab = 'Applied' | 'Accepted' | 'Rejected';

const applicantTabs: ApplicantTab[] = ['Applied', 'Accepted', 'Rejected'];

function statusForTab(applicant: Applicant): ApplicantTab {
  return applicant.status === 'Pending' ? 'Applied' : applicant.status;
}

export default function ResearcherMyStudiesScreen() {
  const { studies, setRole, isParticipantSetupComplete } = useRole();
  const [openStudyId, setOpenStudyId] = useState(studies[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<ApplicantTab>('Applied');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const openStudy = useMemo(() => studies.find((study) => study.id === openStudyId) ?? studies[0], [openStudyId, studies]);
  const studyApplicants = useMemo(
    () => (openStudy ? mockApplicants.filter((entry) => entry.studyId === openStudy.id) : []),
    [openStudy]
  );
  const tabApplicants = studyApplicants.filter((applicant) => statusForTab(applicant) === activeTab);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Manage your studies, applicant notifications, and participant chats." />
      <Button
        title="Switch to participant"
        variant="secondary"
        onPress={() => {
          setRole('participant');
          router.replace(isParticipantSetupComplete ? '/(participant)' : '/(auth)/setup');
        }}
      />
      {studies.map((study) => {
        const applicants = mockApplicants.filter((entry) => entry.studyId === study.id);
        const newApplicants = applicants.filter((entry) => entry.isNew).length;
        const isOpen = openStudy?.id === study.id;
        return (
          <Card key={study.id}>
            <Pressable onPress={() => setOpenStudyId(study.id)} accessibilityRole="button">
              <View style={styles.rowBetween}>
                <View style={styles.badges}><Badge label={study.theme} /><Badge label={study.mode} /></View>
                <View style={styles.ticker}><Text style={styles.tickerText}>{newApplicants}</Text></View>
              </View>
              <Text style={styles.title}>{study.title}</Text>
              <Text style={styles.text}>{study.reward} • {study.duration} • {applicants.length} applicants</Text>
            </Pressable>

            {isOpen ? (
              <View style={styles.applicantPanel}>
                <View style={styles.tabs}>
                  {applicantTabs.map((tab) => (
                    <FilterChip key={tab} label={tab} active={activeTab === tab} onPress={() => setActiveTab(tab)} />
                  ))}
                </View>
                {tabApplicants.length === 0 ? (
                  <EmptyState title={`No ${activeTab.toLowerCase()} applicants`} subtitle="Applicants will appear here as they move through your review flow." />
                ) : (
                  tabApplicants.map((applicant) => (
                    <Pressable key={applicant.id} onPress={() => setSelectedApplicant(applicant)} style={styles.applicantRow}>
                      <View style={styles.applicantText}>
                        <Text style={styles.applicantName}>{applicant.name}</Text>
                        <Text style={styles.text}>Age {applicant.age} · {applicant.summary}</Text>
                      </View>
                      {applicant.status === 'Accepted' ? (
                        <Pressable onPress={() => router.push(`/(researcher)/chat/${study.id}`)} style={styles.chatButton}>
                          <Text style={styles.chatIcon}>💬</Text>
                        </Pressable>
                      ) : null}
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}
          </Card>
        );
      })}

      <Modal visible={Boolean(selectedApplicant)} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedApplicant?.name}</Text>
            <Text style={styles.text}>Status: {selectedApplicant?.status}</Text>
            <Text style={styles.text}>Age: {selectedApplicant?.age}</Text>
            <Text style={styles.text}>Summary: {selectedApplicant?.summary}</Text>
            <Text style={styles.text}>Provided info preview: age, study fit summary, availability, and profile fields requested during application.</Text>
            <Pressable onPress={() => setSelectedApplicant(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, flex: 1 },
  ticker: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs
  },
  tickerText: { color: '#fff', fontWeight: '800' },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  applicantPanel: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md, gap: theme.spacing.md },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  applicantText: { flex: 1, gap: theme.spacing.xs },
  applicantName: { color: theme.colors.textPrimary, fontWeight: '800' },
  chatButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF9F2', justifyContent: 'center', alignItems: 'center' },
  chatIcon: { fontSize: 20 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: theme.spacing.lg },
  modalCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h2, fontWeight: '800' },
  closeButton: { alignSelf: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  closeText: { color: '#fff', fontWeight: '800' }
});
