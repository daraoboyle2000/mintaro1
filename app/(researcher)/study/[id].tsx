import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { useRole } from '@/context/RoleContext';
import { Applicant } from '@/types';
import { theme } from '@/theme';

type ApplicantTab = 'Applied' | 'Booked' | 'Rejected';
const applicantTabs: ApplicantTab[] = ['Applied', 'Booked', 'Rejected'];

function returnToMyStudies() {
  router.replace('/(researcher)');
}

function firstNameLabel(applicant: Applicant) {
  return applicant.name.split(' ')[0] || applicant.name;
}

export default function ResearcherStudyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { applicants: allApplicants, deleteStudy, markResearcherStudyRead, setStudyActive, studies } = useRole();
  const [activeTab, setActiveTab] = useState<ApplicantTab>('Applied');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
  const study = studies.find((entry) => entry.id === id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Pressable onPress={returnToMyStudies} hitSlop={10} style={styles.backPill} accessibilityRole="button" accessibilityLabel="Back to My Studies">
          <Text style={styles.backArrow}>←</Text><Text style={styles.backText}>{study?.title ?? 'My Studies'}</Text>
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
  const tabApplicants = applicants.filter((entry) => (activeTab === 'Applied' ? entry.status === 'Applied' || entry.status === 'Eligible' : entry.status === activeTab));
  const isPublished = study?.isPublished !== false;

  if (!study) {
    return <EmptyState title="Study not found" subtitle="This study may have been deleted." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}><Text style={styles.heading}>Study overview</Text><Pressable onPress={() => setMenuOpen(true)} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Study settings for ${study.title}`}><Ionicons name="ellipsis-horizontal" size={26} color={theme.colors.primaryDark} /></Pressable></View>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.popoverMenu}>
            {isPublished ? (
              <Pressable onPress={() => { setMenuOpen(false); setConfirmAction(study.isActive === false ? 'activate' : 'deactivate'); }}><Text style={styles.menuItem}>{study.isActive === false ? 'Activate study' : 'Deactivate study'}</Text></Pressable>
            ) : null}
            <Pressable onPress={() => { setMenuOpen(false); setConfirmAction('delete'); }}><Text style={[styles.menuItem, styles.deleteText]}>Delete study</Text></Pressable>
          </View>
        </Pressable>
      </Modal>
      <Card>
        <Pressable onPress={() => setDetailsOpen((current) => !current)} style={styles.rowBetween} accessibilityRole="button">
          <Text style={styles.heading}>Study details</Text>
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

      {isPublished ? <View style={styles.tabs}>{applicantTabs.map((tab) => <FilterChip key={tab} label={tab} active={activeTab === tab} onPress={() => setActiveTab(tab)} />)}</View> : null}
      {!isPublished ? (
        <Card><Text style={styles.text}>This study is saved but not published yet.</Text><Button title="Continue editing" onPress={() => router.push({ pathname: '/(researcher)/create-study', params: { id: study.id } })} /></Card>
      ) : tabApplicants.length === 0 ? (
        <EmptyState title={`No ${activeTab.toLowerCase()} participants`} subtitle="Mock and live screening results appear here without exposing raw answers." />
      ) : (
        tabApplicants.map((applicant, index) => {
          const canMessage = applicant.status === 'Booked' || applicant.status === 'Applied' || applicant.status === 'Eligible';
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
      <Modal visible={Boolean(confirmAction)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirmAction === 'delete' ? 'Delete study?' : confirmAction === 'activate' ? 'Activate study?' : 'Deactivate study?'}</Text>
            <Text style={styles.text}>{confirmAction === 'delete' ? 'This will permanently remove the study, participant updates, and chat history.' : confirmAction === 'activate' ? 'Participants will be able to apply to this study.' : 'Participants will not be able to apply while this study is inactive.'}</Text>
            <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setConfirmAction(null)} /><Button title={confirmAction === 'delete' ? 'Delete' : confirmAction === 'activate' ? 'Activate' : 'Deactivate'} onPress={() => { if (!confirmAction) return; if (confirmAction === 'delete') { deleteStudy(study.id); setConfirmAction(null); router.replace('/(researcher)'); return; } if (isPublished) setStudyActive(study.id, confirmAction === 'activate'); setConfirmAction(null); setMenuOpen(false); }} /></View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginLeft: theme.spacing.md },
  backArrow: { color: theme.colors.primaryDark, fontWeight: '900', fontSize: theme.typography.h3 },
  backText: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: theme.typography.h3 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md },
  menuBackdrop: { flex: 1, alignItems: 'flex-end', paddingTop: 92, paddingRight: theme.spacing.lg },
  popoverMenu: { backgroundColor: '#fff', borderRadius: theme.radius.md, padding: theme.spacing.sm, minWidth: 190, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  heading: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  securityText: { color: theme.colors.primaryDark, lineHeight: 20, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  chatButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, alignSelf: 'flex-start', backgroundColor: '#EAF9F2', borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  chatText: { color: theme.colors.primaryDark, fontWeight: '800' },
  menuItem: { color: theme.colors.textPrimary, fontWeight: '800', paddingVertical: theme.spacing.xs },
  deleteText: { color: '#B91C1C' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: theme.spacing.lg },
  modalCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '800' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }
});
