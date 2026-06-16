import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function StudyDetailsScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const navigation = useNavigation();
  const { applications, applyToStudy, studies } = useRole();
  const study = studies.find((entry) => entry.id === id);
  const application = applications.find((entry) => entry.studyId === id && entry.status !== 'Rejected');
  const openedFromMyStudies = from === 'my-studies';
  const isAlreadyApplied = Boolean(application);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Pressable onPress={() => router.replace(openedFromMyStudies ? '/(participant)/applications' : '/(participant)')} hitSlop={10} style={styles.backPill} accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text><Text style={styles.backLink}>{openedFromMyStudies ? (study?.title ?? 'Study') : 'Browse studies'}</Text>
        </Pressable>
      )
    });
  }, [navigation, openedFromMyStudies, study?.title]);

  useFocusEffect(
    useCallback(() => {
      if (!openedFromMyStudies) {
        return undefined;
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.replace('/(participant)/applications');
        return true;
      });

      return () => subscription.remove();
    }, [openedFromMyStudies])
  );

  if (!study) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Study not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title={study.title} subtitle={study.shortDescription} />
      <View style={styles.tags}><Badge label={study.mode} /><Badge label={study.theme} /></View>
      <Card>
        <Text style={styles.heading}>Study details</Text>
        <Text style={styles.text}>{study.details}</Text>
        <Text style={styles.text}>Theme: {study.theme}</Text>
        <Text style={styles.text}>Reward: {study.rewardKind} · {study.reward}</Text>
        <Text style={styles.text}>Duration: {study.durationMins} min</Text>
        <Text style={styles.text}>Location type: {study.locationKind}</Text>
        <Text style={styles.text}>Location: {study.location}</Text>
        <Text style={styles.text}>Eligibility: {study.eligibilitySummary}</Text>
        <Text style={styles.text}>Required info: {study.requiredInfoFields.join(', ')}</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>Tags</Text>
        <View style={styles.tags}>
          {study.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
      </Card>
      {isAlreadyApplied ? (
        <View style={styles.appliedState}>
          <Text style={styles.appliedTitle}>Eligibility confirmed</Text>
          <Text style={styles.appliedText}>Mintaro screened your eligibility automatically. Researchers only see minimum necessary information until you are booked.</Text>
        </View>
      ) : (
        <Button title="Check eligibility" onPress={() => applyToStudy(study)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  missing: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missingText: { color: theme.colors.textSecondary },
  heading: { color: theme.colors.textPrimary, fontWeight: '700', fontSize: theme.typography.h3 },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  appliedState: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: '#EAF9F2',
    borderWidth: 1,
    borderColor: '#D3F3E4',
    gap: theme.spacing.xs
  },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginLeft: theme.spacing.md },
  backArrow: { color: theme.colors.primaryDark, fontWeight: '900', fontSize: theme.typography.h3 },
  backLink: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: theme.typography.h3 },
  appliedTitle: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: theme.typography.body },
  appliedText: { color: theme.colors.textSecondary, lineHeight: 20 }
});
