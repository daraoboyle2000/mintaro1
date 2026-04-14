import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

const filters = ['Nearby', 'Reward', 'Online', 'Time'];

export default function ParticipantBrowseScreen() {
  const [search, setSearch] = useState('');

  const studies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return mockStudies;
    }
    return mockStudies.filter(
      (study) =>
        study.title.toLowerCase().includes(query) ||
        study.shortDescription.toLowerCase().includes(query) ||
        study.tags.join(' ').toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Hi there 👋" subtitle="Browse studies matched to your profile" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search studies"
        style={styles.search}
      />
      <View style={styles.chips}>
        {filters.map((filter, index) => (
          <FilterChip key={filter} label={filter} active={index === 2} />
        ))}
      </View>

      <View style={styles.list}>
        {studies.map((study) => (
          <Card key={study.id}>
            <Badge label={study.mode} />
            <Text style={styles.cardTitle}>{study.title}</Text>
            <Text style={styles.cardDescription}>{study.shortDescription}</Text>
            <Text style={styles.meta}>
              {study.reward} • {study.duration} • {study.location}
            </Text>
            <View style={styles.rowButtons}>
              <Button title="View details" variant="secondary" onPress={() => router.push(`/study/${study.id}`)} />
              <Button title="Apply" onPress={() => router.push('/(participant)/applications')} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body,
    backgroundColor: '#fff'
  },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap'
  },
  list: {
    gap: theme.spacing.md
  },
  cardTitle: {
    fontSize: theme.typography.h3,
    color: theme.colors.textPrimary,
    fontWeight: '700'
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body
  },
  meta: {
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  rowButtons: {
    gap: theme.spacing.sm
  }
});
