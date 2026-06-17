import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { useRole } from '@/context/RoleContext';
import { eligibilityFields, locationKinds, rewardKinds, studyThemes } from '@/data/studyOptions';
import { theme } from '@/theme';
import { CustomScreeningQuestion, EligibilityAnswerKind, EligibilityCriterion, LocationKind, RewardKind, Study, StudyFieldRequirement, StudyTheme } from '@/types';

function parseNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function modeFromLocationKind(locationKind: LocationKind): Study['mode'] {
  if (locationKind === 'Online') {
    return 'Remote';
  }
  if (locationKind === 'Both') {
    return 'Hybrid';
  }
  return 'In person';
}

const sexOptions = ['Any', 'Female', 'Male', 'Intersex'];
const genderOptions = ['Any', 'Woman', 'Man', 'Non-binary', 'Prefer to self-describe'];
const raceEthnicityOptions = ['Any', 'Asian', 'Black or African descent', 'Hispanic / Latine', 'Indigenous', 'Middle Eastern or North African', 'White', 'Multiple backgrounds'];
const healthStatusOptions = ['Excellent', 'Very good', 'Good', 'Fair', 'Poor', 'Chronic condition', 'No MRI contraindications', 'No mobility restrictions', 'No implanted medical device', 'Pregnant or planning pregnancy', 'Currently taking prescription medication', 'Recent surgery', 'Vision impairment', 'Hearing impairment'];
const smokingOptions = ['Any', 'Never smoker', 'Former smoker', 'Current smoker', 'Vape / nicotine use'];
const answerKinds: EligibilityAnswerKind[] = ['yesNo', 'multipleChoice', 'range', 'locationRadius'];
const AGE_MIN = 18;
const AGE_MAX = 100;
const AGE_SPAN = AGE_MAX - AGE_MIN;


function DualAgeSlider({
  min,
  max,
  onChange,
  onDragActiveChange
}: {
  min: number;
  max: number;
  onChange: (next: { min: number; max: number }) => void;
  onDragActiveChange?: (active: boolean) => void;
}) {
  const [width, setWidth] = useState(1);
  const wrapperRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const values = useRef({ min, max });
  const activeThumb = useRef<'min' | 'max' | null>(null);
  const horizontalDragActive = useRef(false);

  useEffect(() => {
    values.current = { min, max };
  }, [max, min]);

  const clamp = (value: number, lower: number, upper: number) => Math.min(upper, Math.max(lower, value));
  const ageToX = (age: number) => ((age - AGE_MIN) / AGE_SPAN) * width;
  const ageFromX = (x: number) => Math.round(AGE_MIN + (clamp(x, 0, width) / width) * AGE_SPAN);
  const measureTrack = () => {
    wrapperRef.current?.measure((_x, _y, measuredWidth, _height, pageX) => {
      if (measuredWidth > 0) {
        setWidth(Math.max(measuredWidth, 1));
      }
      trackPageX.current = pageX;
    });
  };
  const relativeXFromEvent = (event: GestureResponderEvent) => {
    const pageX = event.nativeEvent.pageX;
    if (typeof pageX === 'number' && trackPageX.current) {
      return pageX - trackPageX.current;
    }
    return event.nativeEvent.locationX;
  };
  const updateThumb = (x: number) => {
    const thumb = activeThumb.current;
    if (!thumb) {
      return;
    }
    const nextAge = ageFromX(x);
    if (thumb === 'min') {
      onChange({ min: clamp(nextAge, AGE_MIN, values.current.max), max: values.current.max });
      return;
    }
    onChange({ min: values.current.min, max: clamp(nextAge, values.current.min, AGE_MAX) });
  };
  const beginInteraction = (event: GestureResponderEvent) => {
    measureTrack();
    const x = relativeXFromEvent(event);
    const distanceToMin = Math.abs(x - ageToX(values.current.min));
    const distanceToMax = Math.abs(x - ageToX(values.current.max));
    activeThumb.current = distanceToMin <= distanceToMax ? 'min' : 'max';
    updateThumb(x);
  };
  const endInteraction = () => {
    activeThumb.current = null;
    horizontalDragActive.current = false;
    onDragActiveChange?.(false);
  };

  const trackResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onMoveShouldSetPanResponderCapture: (_event, gesture) => Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: (event) => {
      beginInteraction(event);
    },
    onPanResponderMove: (event, gesture) => {
      if (!horizontalDragActive.current && Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
        horizontalDragActive.current = true;
        onDragActiveChange?.(true);
      }
      updateThumb(relativeXFromEvent(event));
    },
    onPanResponderTerminationRequest: (_event, gesture) => !(horizontalDragActive.current || Math.abs(gesture.dx) > Math.abs(gesture.dy)),
    onPanResponderRelease: endInteraction,
    onPanResponderTerminate: endInteraction
  })).current;

  const minPct = ((min - AGE_MIN) / AGE_SPAN) * 100;
  const maxPct = ((max - AGE_MIN) / AGE_SPAN) * 100;
  return (
    <View ref={wrapperRef} style={styles.dualSlider} onLayout={(event) => { setWidth(Math.max(event.nativeEvent.layout.width, 1)); measureTrack(); }} {...trackResponder.panHandlers}>
      <View style={styles.sliderTrack}><View style={[styles.sliderFill, { left: `${minPct}%`, right: `${100 - maxPct}%` }]} /></View>
      <View pointerEvents="none" style={[styles.sliderTouchTarget, { left: `${minPct}%` }]}><View style={styles.sliderThumb}><Text style={styles.thumbLabel}>{min}</Text></View></View>
      <View pointerEvents="none" style={[styles.sliderTouchTarget, { left: `${maxPct}%` }]}><View style={styles.sliderThumb}><Text style={styles.thumbLabel}>{max}</Text></View></View>
    </View>
  );
}

function buildEligibilitySummary(criteria: EligibilityCriterion[]) {
  if (criteria.length === 0) {
    return 'No strict eligibility criteria beyond required study information.';
  }
  return criteria.map((criterion) => `${criterion.label}: ${criterion.value}`).join('; ');
}

export default function CreateStudyScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { createStudy, researcherProfile, studies, updateStudy } = useRole();
  const editingStudy = studies.find((entry) => entry.id === id);
  const scrollRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState(editingStudy?.title ?? '');
  const [summary, setSummary] = useState(editingStudy?.shortDescription ?? '');
  const [themeChoice, setThemeChoice] = useState<StudyTheme>(editingStudy?.theme ?? 'Neuroscience');
  const [rewardKind, setRewardKind] = useState<RewardKind>(editingStudy?.rewardKind ?? 'Monetary');
  const [rewardAmount, setRewardAmount] = useState(editingStudy?.rewardValue ? String(editingStudy.rewardValue) : '');
  const [rewardOther, setRewardOther] = useState(editingStudy?.rewardKind === 'Other' ? editingStudy.reward : '');
  const [durationMins, setDurationMins] = useState(editingStudy?.durationMins ? String(editingStudy.durationMins) : '45');
  const [locationKind, setLocationKind] = useState<LocationKind>(editingStudy?.locationKind ?? 'Online');
  const [location, setLocation] = useState(editingStudy?.locationKind === 'Online' ? '' : editingStudy?.location ?? '');
  const [ageMin, setAgeMin] = useState(parseNumber(editingStudy?.eligibilityCriteria.find((criterion) => criterion.field === 'ageRange')?.value ?? '18') || 18);
  const [ageMax, setAgeMax] = useState(parseNumber(editingStudy?.eligibilityCriteria.find((criterion) => criterion.field === 'ageRange')?.value.split('-')[1] ?? '65') || 65);
  const [eligibilityValues, setEligibilityValues] = useState<Record<StudyFieldRequirement, string>>({} as Record<StudyFieldRequirement, string>);
  const [healthStatusMatters, setHealthStatusMatters] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswerKind, setCustomAnswerKind] = useState<EligibilityAnswerKind>('yesNo');
  const [customEligibleAnswer, setCustomEligibleAnswer] = useState('yes');
  const [customRangeMin, setCustomRangeMin] = useState('');
  const [customRangeMax, setCustomRangeMax] = useState('');
  const [customRadius, setCustomRadius] = useState('');
  const [customChoiceDraft, setCustomChoiceDraft] = useState('');
  const [customChoices, setCustomChoices] = useState<string[]>([]);
  const [customQuestionError, setCustomQuestionError] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomScreeningQuestion[]>(editingStudy?.customScreeningQuestions ?? []);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [requiredInfoFields, setRequiredInfoFields] = useState<StudyFieldRequirement[]>(editingStudy?.requiredInfoFields ?? ['ageRange']);
  const [sliderDragActive, setSliderDragActive] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'Create a study', headerTitleAlign: 'center' });
  }, [navigation]);

  const eligibilityCriteria = useMemo(
    () =>
      eligibilityFields
        .map((field) => ({ field: field.field, label: field.label, value: field.field === 'ageRange' ? `${ageMin}-${ageMax}` : eligibilityValues[field.field]?.trim() ?? '', answerKind: field.field === 'ageRange' ? 'range' as const : field.field === 'distancePreference' ? 'locationRadius' as const : 'multipleChoice' as const, locked: true, minimumNecessaryOnly: true }))
        .filter((entry) => Boolean(entry.value)) as EligibilityCriterion[],
    [ageMax, ageMin, eligibilityValues]
  );

  const rewardText =
    rewardKind === 'None'
      ? 'No reward'
      : rewardKind === 'Other'
        ? rewardOther.trim()
        : `${rewardKind === 'Monetary' ? '$' : '$'}${rewardAmount.trim()} ${rewardKind === 'Voucher / gift card' ? 'gift card' : ''}`.trim();

  const needsLocationDetails = locationKind !== 'Online';
  const canPublish = Boolean(
    title.trim() &&
      summary.trim() &&
      durationMins.trim() &&
      (rewardKind === 'None' || (rewardKind === 'Other' ? rewardOther.trim() : rewardAmount.trim())) &&
      (!needsLocationDetails || location.trim()) &&
      requiredInfoFields.length > 0 &&
      ageMin <= ageMax
  );

  const toggleRequiredInfo = (field: StudyFieldRequirement) => {
    setRequiredInfoFields((current) =>
      current.includes(field) ? current.filter((entry) => entry !== field) : [...current, field]
    );
  };

  const buildStudy = (isPublished: boolean): Study => {
    const cleanDurationMins = parseNumber(durationMins);
    const mode = modeFromLocationKind(locationKind);
    return {
      id: editingStudy?.id ?? `s-${Date.now()}`,
      title: title.trim() || 'Untitled study',
      shortDescription: summary.trim(),
      details: summary.trim(),
      reward: rewardText,
      rewardValue: rewardKind === 'None' || rewardKind === 'Other' ? 0 : parseNumber(rewardAmount),
      rewardKind,
      duration: `${cleanDurationMins} min`,
      durationMins: cleanDurationMins,
      location: locationKind === 'Online' ? 'Online' : location.trim(),
      locationKind,
      mode,
      tags: ['New', themeChoice, mode],
      theme: themeChoice,
      eligibilitySummary: buildEligibilitySummary(eligibilityCriteria),
      eligibilityCriteria,
      requiredInfoFields,
      researcherFirstName: researcherProfile.firstName ?? researcherProfile.institution ?? 'Researcher',
      requiredProfileFields: requiredInfoFields,
      customScreeningQuestions: customQuestions,
      criteriaLocked: isPublished,
      privacyStage: 'anonymous-eligible',
      isActive: isPublished,
      isPublished
    };
  };

  const saveStudy = (isPublished: boolean) => {
    const study = buildStudy(isPublished);
    if (editingStudy) updateStudy(study); else createStudy(study);
    router.replace('/(researcher)');
  };

  const publishStudy = () => {
    if (customAnswerKind === 'multipleChoice' && customQuestion.trim() && !customChoices.includes(customEligibleAnswer)) {
      setCustomQuestionError('Choose the correct eligible answer for this multiple choice question before publishing.');
      return;
    }
    if (!canPublish) {
      const field = !title.trim() ? 'title' : !summary.trim() ? 'summary' : !durationMins.trim() ? 'duration' : rewardKind !== 'None' && !(rewardKind === 'Other' ? rewardOther.trim() : rewardAmount.trim()) ? 'reward' : needsLocationDetails && !location.trim() ? 'location' : 'requiredInfo';
      setHighlightedField(field);
      scrollRef.current?.scrollTo({ y: field === 'title' || field === 'summary' ? 0 : field === 'reward' ? 220 : field === 'duration' || field === 'location' ? 420 : 900, animated: true });
      return;
    }
    saveStudy(true);
  };

  const saveCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    if (customAnswerKind === 'multipleChoice' && !customChoices.includes(customEligibleAnswer)) {
      setCustomQuestionError('Select the correct answer option.');
      return;
    }
    const eligibleAnswer = customAnswerKind === 'yesNo' ? customEligibleAnswer === 'yes' : customAnswerKind === 'range' ? { min: parseNumber(customRangeMin), max: parseNumber(customRangeMax) } : customAnswerKind === 'locationRadius' ? { radius: parseNumber(customRadius) } : customEligibleAnswer ? [customEligibleAnswer] : customChoices;
    const nextQuestion = { id: editingQuestionId ?? `cq-${Date.now()}`, question: customQuestion.trim(), answerKind: customAnswerKind, eligibleAnswer };
    setCustomQuestions((current) => editingQuestionId ? current.map((entry) => entry.id === editingQuestionId ? nextQuestion : entry) : [...current, nextQuestion]);
    setEditingQuestionId(null); setCustomQuestion(''); setCustomEligibleAnswer('yes'); setCustomRangeMin(''); setCustomRangeMax(''); setCustomRadius(''); setCustomChoices([]);
  };

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" scrollEnabled={!sliderDragActive}>
      <Card>
        <View style={styles.fields}>
          <TextInput value={title} onChangeText={(value) => { setTitle(value); setHighlightedField(null); }} placeholder="Study title" style={[styles.input, highlightedField === 'title' && styles.highlightedInput]} />
          <TextInput value={summary} onChangeText={(value) => { setSummary(value); setHighlightedField(null); }} placeholder="Short participant-facing summary" style={[styles.input, highlightedField === 'summary' && styles.highlightedInput]} multiline />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.chips}>
          {studyThemes.map((themeOption) => (
            <FilterChip key={themeOption} label={themeOption} active={themeChoice === themeOption} onPress={() => setThemeChoice(themeOption)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Reward</Text>
        <View style={styles.chips}>
          {rewardKinds.map((option) => (
            <FilterChip key={option} label={option} active={rewardKind === option} onPress={() => setRewardKind(option)} />
          ))}
        </View>
        {rewardKind === 'Monetary' || rewardKind === 'Voucher / gift card' ? (
          <TextInput value={rewardAmount} onChangeText={(value) => { setRewardAmount(value); setHighlightedField(null); }} keyboardType="numeric" placeholder="Amount" style={[styles.input, highlightedField === 'reward' && styles.highlightedInput]} />
        ) : null}
        {rewardKind === 'Other' ? (
          <TextInput value={rewardOther} onChangeText={(value) => { setRewardOther(value); setHighlightedField(null); }} placeholder="Describe the reward" style={[styles.input, highlightedField === 'reward' && styles.highlightedInput]} />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Duration and location</Text>
        <TextInput value={durationMins} onChangeText={(value) => { setDurationMins(value); setHighlightedField(null); }} keyboardType="numeric" placeholder="Duration in minutes" style={[styles.input, highlightedField === 'duration' && styles.highlightedInput]} />
        <View style={styles.chips}>
          {locationKinds.map((option) => (
            <FilterChip key={option} label={option} active={locationKind === option} onPress={() => setLocationKind(option)} />
          ))}
        </View>
        {needsLocationDetails ? (
          <>
            <TextInput value={location} onChangeText={(value) => { setLocation(value); setHighlightedField(null); }} placeholder="Location address or city" style={[styles.input, highlightedField === 'location' && styles.highlightedInput]} />
            <Text style={styles.note}>Map picker placeholder: this field is ready for a future maps API integration.</Text>
          </>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Eligibility criteria</Text>
        <Text style={styles.note}>Use typed selections and tactile ranges. Criteria lock when the study is published.</Text>
        <View style={styles.criteriaBlock}>
          <Text style={styles.label}>Age range: {ageMin}–{ageMax}</Text>
          <DualAgeSlider min={ageMin} max={ageMax} onChange={({ min, max }) => { setAgeMin(min); setAgeMax(max); }} onDragActiveChange={setSliderDragActive} />
        </View>
        <View style={styles.divider} />
        <View style={styles.criteriaBlock}>
        <Text style={styles.label}>Sex</Text>
        <View style={styles.chips}>{sexOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.sex === option} onPress={() => setEligibilityValues((current) => ({ ...current, sex: option }))} />)}</View>
        </View><View style={styles.divider} /><View style={styles.criteriaBlock}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips}>{genderOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.gender === option} onPress={() => setEligibilityValues((current) => ({ ...current, gender: option }))} />)}</View>
        </View><View style={styles.divider} /><View style={styles.criteriaBlock}>
        <Text style={styles.label}>Race / ethnicity</Text>
        <View style={styles.chips}>{raceEthnicityOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.raceEthnicity === option} onPress={() => setEligibilityValues((current) => ({ ...current, raceEthnicity: option }))} />)}</View>
        </View><View style={styles.divider} /><View style={styles.criteriaBlock}>
        <Pressable onPress={() => setHealthStatusMatters((current) => !current)} style={styles.requiredRow}><View style={[styles.checkbox, healthStatusMatters && styles.checkboxChecked]}>{healthStatusMatters ? <Text style={styles.checkboxTick}>✓</Text> : null}</View><Text style={styles.label}>Health status {healthStatusMatters ? '⌃' : '⌄'}</Text></Pressable>
        {healthStatusMatters ? <><View style={styles.chips}>{healthStatusOptions.map((option) => <FilterChip key={option} label={option} active={(eligibilityValues.healthStatus ?? '').split(', ').includes(option)} onPress={() => setEligibilityValues((current) => { const selected = (current.healthStatus ?? '').split(', ').filter(Boolean); const next = selected.includes(option) ? selected.filter((entry) => entry !== option) : [...selected, option]; return { ...current, healthStatus: next.join(', ') }; })} />)}</View><Text style={styles.label}>Smoking / nicotine</Text><View style={styles.chips}>{smokingOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.smokingStatus === option} onPress={() => setEligibilityValues((current) => ({ ...current, smokingStatus: option }))} />)}</View></> : null}
        </View><View style={styles.divider} /><View style={styles.criteriaBlock}>
        <TextInput value={eligibilityValues.distancePreference ?? ''} onChangeText={(value) => setEligibilityValues((current) => ({ ...current, distancePreference: value }))} placeholder="Location radius, e.g. within 25 km of Toronto" style={styles.input} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Custom screening question</Text>
        <Text style={styles.subsectionTitle}>Question</Text>
        <TextInput value={customQuestion} onChangeText={setCustomQuestion} placeholder="Question shown to participants" style={styles.input} />
        <View style={styles.divider} />
        <Text style={styles.subsectionTitle}>Answer</Text>
        <View style={styles.chips}>{answerKinds.map((kind) => <FilterChip key={kind} label={kind} active={customAnswerKind === kind} onPress={() => setCustomAnswerKind(kind)} />)}</View>
        {customAnswerKind === 'yesNo' ? <View style={styles.chips}><FilterChip label="Yes" active={customEligibleAnswer === 'yes'} onPress={() => setCustomEligibleAnswer('yes')} /><FilterChip label="No" active={customEligibleAnswer === 'no'} onPress={() => setCustomEligibleAnswer('no')} /></View> : null}
        {customAnswerKind === 'range' ? <View style={styles.inlineInputs}><TextInput value={customRangeMin} onChangeText={setCustomRangeMin} keyboardType="numeric" placeholder="Eligible min" style={[styles.input, styles.flexInput]} /><TextInput value={customRangeMax} onChangeText={setCustomRangeMax} keyboardType="numeric" placeholder="Eligible max" style={[styles.input, styles.flexInput]} /></View> : null}
        {customAnswerKind === 'locationRadius' ? <TextInput value={customRadius} onChangeText={setCustomRadius} keyboardType="numeric" placeholder="Eligible radius in km" style={styles.input} /> : null}
        {customAnswerKind === 'multipleChoice' ? <><View style={styles.inlineInputs}><TextInput value={customChoiceDraft} onChangeText={setCustomChoiceDraft} placeholder="Add answer choice" style={[styles.input, styles.flexInput]} /><Button title="Add" variant="secondary" onPress={() => { const choice = customChoiceDraft.trim(); if (!choice) return; setCustomQuestionError(''); setCustomChoices((current) => current.includes(choice) ? current : [...current, choice]); setCustomChoiceDraft(''); }} /></View><View style={styles.chips}>{customChoices.map((choice) => <FilterChip key={choice} label={choice} active={customEligibleAnswer === choice} onPress={() => { setCustomQuestionError(''); setCustomEligibleAnswer(choice); }} />)}</View>{customQuestionError ? <Text style={styles.errorText}>{customQuestionError}</Text> : null}</> : null}
        <Button title={editingQuestionId ? 'Save screening question' : 'Add screening question'} variant="secondary" onPress={saveCustomQuestion} />
        {customQuestions.map((question) => <View key={question.id} style={styles.questionRow}><Pressable style={styles.questionText} onPress={() => { setEditingQuestionId(question.id); setCustomQuestion(question.question); setCustomAnswerKind(question.answerKind); }}><Text style={styles.note}>• {question.question} ({question.answerKind})</Text></Pressable><Button title="Delete" variant="secondary" onPress={() => setCustomQuestions((current) => current.filter((entry) => entry.id !== question.id))} /></View>)}
      </Card>

      <Card>
        <View style={highlightedField === 'requiredInfo' ? styles.highlightedCard : undefined}>
        <Text style={styles.sectionTitle}>Required participant info</Text>
        <Text style={styles.note}>Choose which categories applicants must provide, without setting pass/fail criteria.</Text>
        <View style={styles.requiredGrid}>
          {eligibilityFields.map((field) => (
            <Pressable key={field.field} onPress={() => toggleRequiredInfo(field.field)} style={styles.requiredRow}>
              <View style={[styles.checkbox, requiredInfoFields.includes(field.field) && styles.checkboxChecked]}>
                {requiredInfoFields.includes(field.field) ? <Text style={styles.checkboxTick}>✓</Text> : null}
              </View>
              <Text style={styles.label}>{field.label}</Text>
            </Pressable>
          ))}
        </View>
        </View>
      </Card>
      <View style={styles.actions}><Button title="Save" variant="secondary" onPress={() => saveStudy(false)} /><Button title="Save and publish" onPress={publishStudy} /></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  fields: { gap: theme.spacing.sm },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '800' },
  label: { color: theme.colors.textPrimary, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#fff'
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  criteriaRow: { gap: theme.spacing.xs },
  requiredGrid: { gap: theme.spacing.sm },
  requiredRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
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
  note: { color: theme.colors.textSecondary, lineHeight: 20 },
  rangeSelector: { gap: theme.spacing.md },
  ageControl: { gap: theme.spacing.xs },
  criteriaBlock: { gap: theme.spacing.sm },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  dualSlider: { height: 54, justifyContent: 'center', marginHorizontal: theme.spacing.sm },
  sliderTrack: { height: 8, borderRadius: 999, backgroundColor: theme.colors.border, overflow: 'hidden' },
  sliderFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: theme.colors.primary, borderRadius: 999 },
  sliderTouchTarget: { position: 'absolute', marginLeft: -24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sliderThumb: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  thumbLabel: { color: '#fff', fontSize: 11, fontWeight: '900' },
  subsectionTitle: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: theme.typography.body },
  errorText: { color: '#B91C1C', fontWeight: '800' },
  inlineInputs: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  flexInput: { flex: 1 },
  highlightedInput: { borderColor: '#DC2626', borderWidth: 2, backgroundColor: '#FEF2F2' },
  highlightedCard: { borderColor: '#DC2626', borderWidth: 2 },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  questionText: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }
});
