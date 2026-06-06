import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

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
type ApplyPhase = 'idle' | 'loading' | 'success';

type StudyCardProps = {
  study: Study;
  phase: ApplyPhase;
  onApply: (study: Study) => void;
  onFinished: (study: Study) => void;
};

function AnimatedStudyCard({ study, phase, onApply, onFinished }: StudyCardProps) {
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslate = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(1)).current;
  const menuTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'success') {
      return;
    }
    Animated.sequence([
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(menuOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(menuTranslate, { toValue: 18, duration: 260, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 420, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 30, duration: 420, useNativeDriver: true })
      ])
    ]).start(() => onFinished(study));
  }, [cardOpacity, cardTranslate, menuOpacity, menuTranslate, onFinished, phase, study]);

  return (
    <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }}>
      <Card>
        <Badge label={study.mode} />
        <Text style={styles.cardTitle}>{study.title}</Text>
        <Text style={styles.cardDescription}>{study.shortDescription}</Text>
        <Text style={styles.meta}>
          {study.reward} • {study.duration} • {study.location}
        </Text>
        <Animated.View style={[styles.rowButtons, { opacity: menuOpacity, transform: [{ translateY: menuTranslate }] }]}>
          <Button title="View details" variant="secondary" onPress={() => router.push(`/(participant)/study/${study.id}`)} />
          <Pressable
            disabled={phase !== 'idle'}
            onPress={() => onApply(study)}
            style={[styles.applyButton, phase !== 'idle' && styles.applyButtonLocked]}
          >
            {phase === 'loading' ? <ActivityIndicator color="#fff" size="small" /> : null}
            {phase === 'success' ? <Text style={styles.tick}>✓</Text> : null}
            {phase === 'idle' ? <Text style={styles.applyButtonText}>Apply</Text> : null}
          </Pressable>
        </Animated.View>
      </Card>
    </Animated.View>
  );
}

export default function ParticipantBrowseScreen() {
  const { profile, applyToStudy, missingFieldsForStudy, setProfile } = useRole();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hiddenStudyIds, setHiddenStudyIds] = useState<string[]>([]);
  const [questionnaireStudy, setQuestionnaireStudy] = useState<Study | null>(null);
  const [pendingFields, setPendingFields] = useState<StudyFieldRequirement[]>([]);
  const [applyPhases, setApplyPhases] = useState<Record<string, ApplyPhase>>({});
  const [showMyStudiesPulse, setShowMyStudiesPulse] = useState(false);
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseTranslate = useRef(new Animated.Value(10)).current;

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

  const showPulse = () => {
    pulseOpacity.setValue(0);
    pulseTranslate.setValue(10);
    setShowMyStudiesPulse(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseTranslate, { toValue: 0, duration: 180, useNativeDriver: true })
      ]),
      Animated.delay(850),
      Animated.parallel([
        Animated.timing(pulseOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(pulseTranslate, { toValue: -12, duration: 320, useNativeDriver: true })
      ])
    ]).start(() => setShowMyStudiesPulse(false));
  };

  const runApplyAnimation = (study: Study) => {
    setApplyPhases((current) => ({ ...current, [study.id]: 'loading' }));
    setTimeout(() => {
      applyToStudy(study);
      showPulse();
      setApplyPhases((current) => ({ ...current, [study.id]: 'success' }));
    }, 650);
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

  const onApplyFinished = (study: Study) => {
    setHiddenStudyIds((current) => (current.includes(study.id) ? current : [...current, study.id]));
    setApplyPhases((current) => ({ ...current, [study.id]: 'idle' }));
  };

  const headerName = profile.firstName || 'there';

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.greetingRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{headerName.charAt(0).toUpperCase()}</Text></View>
          <SectionHeader title={`Hi ${headerName} 👋`} subtitle="Browse studies matched to your profile" />
        </View>

        <TextInput value={search} onChangeText={setSearch} placeholder="Search studies" style={styles.search} />
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
            <AnimatedStudyCard
              key={study.id}
              study={study}
              phase={applyPhases[study.id] ?? 'idle'}
              onApply={onApply}
              onFinished={onApplyFinished}
            />
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
      {showMyStudiesPulse ? (
        <Animated.View style={[styles.myStudiesPulse, { opacity: pulseOpacity, transform: [{ translateY: pulseTranslate }] }]}>
          <Text style={styles.pulsePlus}>+1</Text>
          <Text style={styles.pulseLabel}>My Studies</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
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
  chips: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  list: { gap: theme.spacing.md },
  cardTitle: { fontSize: theme.typography.h3, color: theme.colors.textPrimary, fontWeight: '700' },
  cardDescription: { color: theme.colors.textSecondary, fontSize: theme.typography.body },
  meta: { color: theme.colors.textPrimary, fontWeight: '600' },
  rowButtons: { gap: theme.spacing.sm },
  applyButton: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary
  },
  applyButtonLocked: { backgroundColor: theme.colors.success },
  applyButtonText: { color: '#fff', fontWeight: '600', fontSize: theme.typography.body },
  tick: { color: '#fff', fontWeight: '800', fontSize: theme.typography.h3 },
  myStudiesPulse: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 86,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center'
  },
  pulsePlus: { color: '#fff', fontSize: theme.typography.h2, fontWeight: '800', lineHeight: 24 },
  pulseLabel: { color: '#fff', fontWeight: '700', fontSize: theme.typography.caption },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  modalCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { fontWeight: '700', color: theme.colors.textPrimary, fontSize: theme.typography.h3 },
  modalText: { color: theme.colors.textSecondary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
