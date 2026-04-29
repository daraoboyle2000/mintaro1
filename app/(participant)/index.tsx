import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { Study, StudyFieldRequirement } from '@/types';
import { theme } from '@/theme';

const filterConfig = ['Reward', 'Time', 'Online', 'Distance'] as const;

export default function ParticipantBrowseScreen() {
  const {
    profile,
    applyToStudy,
    missingFieldsForStudy,
    setProfile,
  } = useRole();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hiddenStudyIds, setHiddenStudyIds] = useState<string[]>([]);
  const [questionnaireStudy, setQuestionnaireStudy] = useState<Study | null>(null);
  const [pendingFields, setPendingFields] = useState<StudyFieldRequirement[]>([]);

  const studies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockStudies
      .filter((study) => !hiddenStudyIds.includes(study.id))
      .filter((study) => {
        if (!query) {
          return true;
        }
        return (
          study.title.toLowerCase().includes(query) ||
          study.shortDescription.toLowerCase().includes(query) ||
          study.tags.join(' ').toLowerCase().includes(query)
        );
      })
      .filter((study) => {
        if (activeFilters.includes('Reward') && study.rewardValue < 40) {
          return false;
        }
        if (activeFilters.includes('Time') && study.durationMins > 45) {
          return false;
        }
        if (activeFilters.includes('Online') && study.mode === 'In person') {
          return false;
        }
        if (activeFilters.includes('Distance') && study.mode === 'Remote') {
          return false;
        }
        return true;
      });
  }, [search, activeFilters, hiddenStudyIds]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((entry) => entry !== filter) : [...current, filter]
    );
  };

  const runApplyAnimation = (study: Study) => {
    applyToStudy(study);
    setHiddenStudyIds((current) => (current.includes(study.id) ? current : [...current, study.id]));
  };

  const onApply = (study: Study) => {
    const missing = missingFieldsForStudy(study);
    if (missing.length > 0) {
      setQuestionnaireStudy(study);
      setPendingFields(missing);
      return;
    }
    runApplyAnimation(study);
  };

  const headerName = profile.firstName || 'there';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greetingRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{headerName.charAt(0).toUpperCase()}</Text></View>
        <SectionHeader title={`Hi ${headerName} 👋`} subtitle="Browse studies matched to your profile" />
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search studies"
        style={styles.search}
      />
      <View style={styles.chips}>
        {filterConfig.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilters.includes(filter)}
            onPress={() => toggleFilter(filter)}
          />
        ))}
      </View>

      <View style={styles.list}>
        {studies.map((study) => (
          <View key={study.id}>
            <Card>
              <Badge label={study.mode} />
              <Text style={styles.cardTitle}>{study.title}</Text>
              <Text style={styles.cardDescription}>{study.shortDescription}</Text>
              <Text style={styles.meta}>
                {study.reward} • {study.duration} • {study.location}
              </Text>
              <View style={styles.rowButtons}>
                <Button title="View details" variant="secondary" onPress={() => router.push(`/(participant)/study/${study.id}`)} />
                <Button title="Apply" onPress={() => onApply(study)} />
              </View>
            </Card>
          </View>
        ))}
      </View>

      <Modal visible={Boolean(questionnaireStudy)} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Complete profile to apply</Text>
            <Text style={styles.modalText}>Please answer required fields first.</Text>

            {pendingFields.includes('ageRange') ? (
              <TextInput
                keyboardType="numeric"
                placeholder="Your age"
                style={styles.search}
                value={profile.age ? `${profile.age}` : ''}
                onChangeText={(value) =>
                  setProfile((current) => ({ ...current, age: value ? Number(value) : undefined }))
                }
              />
            ) : null}

            {pendingFields.includes('smoker') ? (
              <View style={styles.switchRow}>
                <Text style={styles.modalText}>Are you a smoker?</Text>
                <Switch
                  value={Boolean(profile.smoker)}
                  onValueChange={(value) => setProfile((current) => ({ ...current, smoker: value }))}
                />
              </View>
            ) : null}

            {pendingFields.includes('distancePreference') ? (
              <View style={styles.chips}>
                {['online', 'in-person', 'any'].map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    active={profile.distancePreference === option}
                    onPress={() =>
                      setProfile((current) => ({
                        ...current,
                        distancePreference: option as 'online' | 'in-person' | 'any'
                      }))
                    }
                  />
                ))}
              </View>
            ) : null}

            <View style={styles.rowButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setQuestionnaireStudy(null);
                  setPendingFields([]);
                }}
              />
              <Button
                title="Save & Apply"
                onPress={() => {
                  if (!questionnaireStudy) {
                    return;
                  }
                  runApplyAnimation(questionnaireStudy);
                  setQuestionnaireStudy(null);
                  setPendingFields([]);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  greetingRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF9F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: theme.typography.h3 },
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md
  },
  modalTitle: { fontWeight: '700', color: theme.colors.textPrimary, fontSize: theme.typography.h3 },
  modalText: { color: theme.colors.textSecondary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
