import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { DateWheelPicker } from '@/components/ui/DateWheelPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { Study, StudyFieldRequirement } from '@/types';
import { theme } from '@/theme';
import { calculateAge } from '@/utils/profile';

const filterConfig = ['Reward', 'Time', 'Study type'] as const;
const rewardOptions = ['Any', 'Voucher', 'Monetary', 'None', 'Other'] as const;
const studyTypeOptions = ['Any', 'Online', 'In person'] as const;
type ApplyPhase = 'idle' | 'loading' | 'success';
type FilterPanel = (typeof filterConfig)[number];
type RewardOption = (typeof rewardOptions)[number];
type StudyTypeOption = (typeof studyTypeOptions)[number];

type RangeFilter = {
  min: string;
  max: string;
};

type BrowseFilters = {
  rewardTypes: RewardOption[];
  monetaryReward: RangeFilter;
  voucherReward: RangeFilter;
  time: RangeFilter;
  studyTypes: StudyTypeOption[];
  distance: RangeFilter;
};

type StudyCardProps = {
  study: Study;
  phase: ApplyPhase;
  onApply: (study: Study) => void;
  onFinished: (study: Study) => void;
};

const defaultFilters: BrowseFilters = {
  rewardTypes: ['Any'],
  monetaryReward: { min: '', max: '' },
  voucherReward: { min: '', max: '' },
  time: { min: '', max: '' },
  studyTypes: ['Any'],
  distance: { min: '', max: '' }
};

function parseRangeValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isRangeMatch(value: number, range: RangeFilter) {
  const min = parseRangeValue(range.min);
  const max = parseRangeValue(range.max);
  if (typeof min === 'number' && value < min) {
    return false;
  }
  if (typeof max === 'number' && value > max) {
    return false;
  }
  return true;
}

function getStudyDistance(study: Study) {
  if (study.mode === 'Remote') {
    return 0;
  }
  if (study.location.includes('Oakland')) {
    return 8;
  }
  if (study.location.includes('San Francisco')) {
    return 3;
  }
  return 12;
}

function getStudyRewardType(study: Study): Exclude<RewardOption, 'Any'> {
  if (study.rewardValue <= 0) {
    return 'None';
  }
  if (/voucher|gift card/i.test(study.reward)) {
    return 'Voucher';
  }
  if (/[$€£]|cash|paid|monetary/i.test(study.reward)) {
    return 'Monetary';
  }
  return 'Other';
}

function CheckboxRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.checkboxRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

function RangeInputs({ label, value, onChange, unit }: { label: string; value: RangeFilter; onChange: (value: RangeFilter) => void; unit: string }) {
  return (
    <View style={styles.rangeGroup}>
      <Text style={styles.rangeLabel}>{label}</Text>
      <View style={styles.rangeRow}>
        <TextInput
          keyboardType="numeric"
          placeholder="Min"
          value={value.min}
          onChangeText={(min) => onChange({ ...value, min })}
          style={styles.rangeInput}
        />
        <Text style={styles.rangeDash}>to</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Max"
          value={value.max}
          onChangeText={(max) => onChange({ ...value, max })}
          style={styles.rangeInput}
        />
        <Text style={styles.rangeUnit}>{unit}</Text>
      </View>
    </View>
  );
}

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
      <Pressable onPress={() => router.push(`/(participant)/study/${study.id}`)} accessibilityRole="button">
        <Card>
          <Badge label={study.mode} />
          <Text style={styles.cardTitle}>{study.title}</Text>
          <Text style={styles.cardDescription}>{study.shortDescription}</Text>
          <Text style={styles.meta}>
            {study.reward} • {study.duration} • {study.location}
          </Text>
          <Animated.View style={[styles.rowButtons, { opacity: menuOpacity, transform: [{ translateY: menuTranslate }] }]}>
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
      </Pressable>
    </Animated.View>
  );
}

export default function ParticipantBrowseScreen() {
  const { profile, applyToStudy, missingFieldsForStudy, setProfile, devModePreset } = useRole();
  const [search, setSearch] = useState('');
  const [openFilter, setOpenFilter] = useState<FilterPanel | null>(null);
  const [filters, setFilters] = useState<BrowseFilters>(defaultFilters);
  const [hiddenStudyIds, setHiddenStudyIds] = useState<string[]>([]);
  const [questionnaireStudy, setQuestionnaireStudy] = useState<Study | null>(null);
  const [pendingFields, setPendingFields] = useState<StudyFieldRequirement[]>([]);
  const [applyPhases, setApplyPhases] = useState<Record<string, ApplyPhase>>({});
  const [showMyStudiesPulse, setShowMyStudiesPulse] = useState(false);
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseTranslate = useRef(new Animated.Value(10)).current;

  const toggleRewardType = (option: RewardOption) => {
    setFilters((current) => {
      if (option === 'Any') {
        return { ...current, rewardTypes: ['Any'] };
      }
      const withoutAny = current.rewardTypes.filter((entry) => entry !== 'Any');
      const rewardTypes = withoutAny.includes(option)
        ? withoutAny.filter((entry) => entry !== option)
        : [...withoutAny, option];
      return { ...current, rewardTypes: rewardTypes.length > 0 ? rewardTypes : ['Any'] };
    });
  };

  const toggleStudyType = (option: StudyTypeOption) => {
    setFilters((current) => {
      if (option === 'Any') {
        return { ...current, studyTypes: ['Any'] };
      }
      const withoutAny = current.studyTypes.filter((entry) => entry !== 'Any');
      const studyTypes = withoutAny.includes(option)
        ? withoutAny.filter((entry) => entry !== option)
        : [...withoutAny, option];
      return { ...current, studyTypes: studyTypes.length > 0 ? studyTypes : ['Any'] };
    });
  };

  const studies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockStudies
      .filter((study) => devModePreset === 'fresh-account' || !hiddenStudyIds.includes(study.id))
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
        const rewardType = getStudyRewardType(study);
        if (!filters.rewardTypes.includes('Any') && !filters.rewardTypes.includes(rewardType)) {
          return false;
        }
        if (rewardType === 'Monetary' && !isRangeMatch(study.rewardValue, filters.monetaryReward)) {
          return false;
        }
        if (rewardType === 'Voucher' && !isRangeMatch(study.rewardValue, filters.voucherReward)) {
          return false;
        }
        if (!isRangeMatch(study.durationMins, filters.time)) {
          return false;
        }
        if (!filters.studyTypes.includes('Any')) {
          const matchesOnline = filters.studyTypes.includes('Online') && (study.mode === 'Remote' || study.mode === 'Hybrid');
          const matchesInPerson = filters.studyTypes.includes('In person') && (study.mode === 'In person' || study.mode === 'Hybrid');
          if (!matchesOnline && !matchesInPerson) {
            return false;
          }
        }
        if (filters.studyTypes.includes('In person') && study.mode !== 'Remote' && !isRangeMatch(getStudyDistance(study), filters.distance)) {
          return false;
        }
        return true;
      });
  }, [search, filters, hiddenStudyIds, devModePreset]);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.greetingRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{headerName.charAt(0).toUpperCase()}</Text></View>
          <SectionHeader title={`Hi ${headerName} 👋`} subtitle="Browse studies matched to your profile" />
        </View>

        <TextInput value={search} onChangeText={setSearch} placeholder="Search studies" style={styles.search} />
        <View style={styles.filterButtons}>
          {filterConfig.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={openFilter === filter}
              onPress={() => setOpenFilter((current) => (current === filter ? null : filter))}
            />
          ))}
        </View>

        {openFilter ? (
          <Card>
            {openFilter === 'Reward' ? (
              <View style={styles.filterPanel}>
                {rewardOptions.map((option) => (
                  <CheckboxRow
                    key={option}
                    label={option}
                    checked={filters.rewardTypes.includes(option)}
                    onPress={() => toggleRewardType(option)}
                  />
                ))}
                {filters.rewardTypes.includes('Voucher') ? (
                  <RangeInputs
                    label="Voucher value"
                    value={filters.voucherReward}
                    unit="$"
                    onChange={(voucherReward) => setFilters((current) => ({ ...current, voucherReward }))}
                  />
                ) : null}
                {filters.rewardTypes.includes('Monetary') ? (
                  <RangeInputs
                    label="Monetary reward"
                    value={filters.monetaryReward}
                    unit="$"
                    onChange={(monetaryReward) => setFilters((current) => ({ ...current, monetaryReward }))}
                  />
                ) : null}
              </View>
            ) : null}
            {openFilter === 'Time' ? (
              <RangeInputs
                label="Study duration"
                value={filters.time}
                unit="min"
                onChange={(time) => setFilters((current) => ({ ...current, time }))}
              />
            ) : null}
            {openFilter === 'Study type' ? (
              <View style={styles.filterPanel}>
                {studyTypeOptions.map((option) => (
                  <CheckboxRow
                    key={option}
                    label={option}
                    checked={filters.studyTypes.includes(option)}
                    onPress={() => toggleStudyType(option)}
                  />
                ))}
                {filters.studyTypes.includes('In person') ? (
                  <RangeInputs
                    label="Distance from you"
                    value={filters.distance}
                    unit="mi"
                    onChange={(distance) => setFilters((current) => ({ ...current, distance }))}
                  />
                ) : null}
              </View>
            ) : null}
          </Card>
        ) : null}

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
                <View style={styles.filterPanel}>
                  <Text style={styles.modalText}>Select your date of birth so Mintaro can calculate your age.</Text>
                  <DateWheelPicker
                    value={profile.dateOfBirth ?? ''}
                    onChange={(dateOfBirth) => setProfile((current) => ({ ...current, dateOfBirth }))}
                  />
                  {profile.dateOfBirth ? (
                    <Text style={styles.modalText}>Calculated age: {calculateAge(profile.dateOfBirth) ?? '—'}</Text>
                  ) : null}
                </View>
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
                <View style={styles.filterButtons}>
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
  filterButtons: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  filterPanel: { gap: theme.spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkboxTick: { color: '#fff', fontWeight: '800', lineHeight: 18 },
  checkboxLabel: { color: theme.colors.textPrimary, fontWeight: '600' },
  rangeGroup: { gap: theme.spacing.sm },
  rangeLabel: { color: theme.colors.textPrimary, fontWeight: '700' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  rangeInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#fff'
  },
  rangeDash: { color: theme.colors.textSecondary, fontWeight: '600' },
  rangeUnit: { color: theme.colors.textSecondary, minWidth: 28 },
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
