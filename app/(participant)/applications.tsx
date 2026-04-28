import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { ApplicationStatus } from '@/types';
import { theme } from '@/theme';

type MyStudyTab = 'Applied' | 'Accepted' | 'Previous';

export default function ApplicationsScreen() {
  const { applications } = useRole();
  const [tab, setTab] = useState<MyStudyTab>('Applied');

  const filtered = applications.filter((entry) => {
    if (tab === 'Applied') {
      return entry.status === 'Applied';
    }
    if (tab === 'Accepted') {
      return entry.status === 'Accepted';
    }
    return entry.status === 'Completed' || entry.status === 'Rejected';
  });

  const toBadgeStatus = (status: ApplicationStatus) => {
    if (status === 'Completed' || status === 'Rejected') {
      return 'Previous';
    }
    return status;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="My Studies" subtitle="Track applies, accepted, and previous studies" />
      <View style={styles.tabs}>
        {(['Applied', 'Accepted', 'Previous'] as const).map((entry) => (
          <FilterChip key={entry} label={entry} active={tab === entry} onPress={() => setTab(entry)} />
        ))}
      </View>
      {filtered.map((application) => {
        const study = mockStudies.find((entry) => entry.id === application.studyId);
        if (!study) {
          return null;
        }

        return (
          <Card key={application.id}>
            <Badge label={toBadgeStatus(application.status)} />
            <Text style={styles.title}>{study.title}</Text>
            <Text style={styles.text}>Reward: {study.reward}</Text>
            <Text style={styles.text}>Updated: {application.updatedAt}</Text>
            <View style={styles.bottomRow}>
              <Text style={styles.text}>Unread updates: {application.unreadUpdates}</Text>
              <Pressable onPress={() => router.push(`/(participant)/chat/${study.id}`)}>
                <Image source={require('../../assets/icons/chat.png')} style={styles.chatIcon} />
              </Pressable>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatIcon: { width: 22, height: 22 }
});
