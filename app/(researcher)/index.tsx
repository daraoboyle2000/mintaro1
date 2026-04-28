import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockApplicants, mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function ResearcherDashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Researcher Dashboard" subtitle="Tap a study to review details and applicants" />
      {mockStudies.map((study) => {
        const studyApplicants = mockApplicants.filter((entry) => entry.studyId === study.id);
        const newApplicants = studyApplicants.filter((entry) => entry.isNew).length;
        return (
          <Pressable key={study.id} onPress={() => router.push(`/(researcher)/study/${study.id}`)}>
            <Card>
              <View style={styles.rowBetween}>
                <Badge label={study.mode} />
                {newApplicants > 0 ? <Badge label={`${newApplicants} new`} /> : null}
              </View>
              <Text style={styles.title}>{study.title}</Text>
              <Text style={styles.text}>Reward: {study.reward}</Text>
              <Text style={styles.text}>Duration: {study.duration}</Text>
              <Text style={styles.text}>Applicants: {studyApplicants.length}</Text>
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  text: { color: theme.colors.textSecondary }
});
