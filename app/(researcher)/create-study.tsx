import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';
import { Study } from '@/types';

function parseNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function detectMode(location: string): Study['mode'] {
  if (/online|remote|virtual/i.test(location)) {
    return 'Remote';
  }
  if (/hybrid/i.test(location)) {
    return 'Hybrid';
  }
  return 'In person';
}

export default function CreateStudyScreen() {
  const { createStudy, researcherProfile } = useRole();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [reward, setReward] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [eligibility, setEligibility] = useState('');

  const canPublish = title.trim() && summary.trim() && reward.trim() && duration.trim() && location.trim() && eligibility.trim();

  const publishStudy = () => {
    if (!canPublish) {
      return;
    }

    const cleanDuration = duration.trim();
    const cleanReward = reward.trim();
    const study: Study = {
      id: `s-${Date.now()}`,
      title: title.trim(),
      shortDescription: summary.trim(),
      details: summary.trim(),
      reward: cleanReward,
      rewardValue: parseNumber(cleanReward),
      duration: cleanDuration,
      durationMins: parseNumber(cleanDuration),
      location: location.trim(),
      mode: detectMode(location),
      tags: ['New', detectMode(location)],
      eligibilitySummary: eligibility.trim(),
      researcherFirstName: researcherProfile.institution ?? 'Researcher',
      requiredProfileFields: ['ageRange']
    };

    createStudy(study);
    router.replace('/(researcher)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Create Study" subtitle="Publish a new listing in minutes" />
      <Card>
        <View style={styles.fields}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Study title" style={styles.input} />
          <TextInput value={summary} onChangeText={setSummary} placeholder="Summary" style={styles.input} />
          <TextInput value={reward} onChangeText={setReward} placeholder="Reward amount" style={styles.input} />
          <TextInput value={duration} onChangeText={setDuration} placeholder="Duration" style={styles.input} />
          <TextInput value={location} onChangeText={setLocation} placeholder="Location or remote" style={styles.input} />
          <TextInput value={eligibility} onChangeText={setEligibility} placeholder="Eligibility requirements" style={styles.input} />
        </View>
      </Card>
      <Text style={styles.note}>Published studies are immediately available in the participant browse section for this session.</Text>
      <Button title="Publish study" onPress={publishStudy} disabled={!canPublish} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  fields: { gap: theme.spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#fff'
  },
  note: { color: theme.colors.textSecondary }
});
