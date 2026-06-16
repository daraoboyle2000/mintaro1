import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { Study } from '@/types';
import { theme } from '@/theme';

type Action = 'activate' | 'deactivate' | 'delete';

export default function ResearcherMyStudiesScreen() {
  const { applicants: allApplicants, deleteStudy, setStudyActive, studies, unreadResearcherUpdatesCount } = useRole();
  const [menuStudyId, setMenuStudyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ study: Study; action: Action } | null>(null);

  const completeAction = () => {
    if (!confirm) return;
    if (confirm.action === 'delete') deleteStudy(confirm.study.id);
    else setStudyActive(confirm.study.id, confirm.action === 'activate');
    setConfirm(null);
    setMenuStudyId(null);
  };

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
                  <Pressable onPress={(event) => { event.stopPropagation(); setMenuStudyId(menuStudyId === study.id ? null : study.id); }} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Study settings for ${study.title}`}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.primaryDark} />
                  </Pressable>
                  <View style={styles.badges}><Badge label={active ? '● Live' : '○ Inactive'} /><Badge label={study.theme} /><Badge label={study.mode} /></View>
                  {unread > 0 ? <View style={styles.unreadBubble}><Text style={styles.unreadText}>{unread}</Text></View> : null}
                </View>
                {menuStudyId === study.id ? (
                  <View style={styles.menu}>
                    <Pressable onPress={() => setConfirm({ study, action: active ? 'deactivate' : 'activate' })}><Text style={styles.menuItem}>{active ? 'Deactivate study' : 'Activate study'}</Text></Pressable>
                    <Pressable onPress={() => setConfirm({ study, action: 'delete' })}><Text style={[styles.menuItem, styles.deleteText]}>Delete study</Text></Pressable>
                  </View>
                ) : null}
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
      <Modal visible={Boolean(confirm)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{confirm?.action === 'delete' ? 'Delete study?' : confirm?.action === 'activate' ? 'Activate study?' : 'Deactivate study?'}</Text>
            <Text style={styles.text}>{confirm?.action === 'activate' ? 'Once activated, participants will be able to apply to this study.' : confirm?.action === 'deactivate' ? 'Once deactivated, participants will not be able to apply to this study. Are you sure?' : 'This will permanently remove the study, its participant updates, and its chat history. Are you sure?'}</Text>
            <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setConfirm(null)} /><Button title={confirm?.action === 'delete' ? 'Delete' : confirm?.action === 'activate' ? 'Activate' : 'Deactivate'} onPress={completeAction} /></View>
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
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  counter: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
  counterText: { color: '#B91C1C', fontWeight: '800' },
  unreadBubble: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#fff', fontWeight: '800' },
  menu: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.sm, gap: theme.spacing.sm },
  menuItem: { color: theme.colors.textPrimary, fontWeight: '700' },
  deleteText: { color: '#B91C1C' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: theme.spacing.lg },
  modalCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '800' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }
});
