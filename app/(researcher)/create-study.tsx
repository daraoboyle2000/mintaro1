import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
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

const ageOptions = Array.from({ length: 83 }, (_, index) => index + 18);
const sexOptions = ['Any', 'Female', 'Male', 'Intersex'];
const genderOptions = ['Any', 'Woman', 'Man', 'Non-binary', 'Prefer to self-describe'];
const raceEthnicityOptions = ['Any', 'Asian', 'Black or African descent', 'Hispanic / Latine', 'Indigenous', 'Middle Eastern or North African', 'White', 'Multiple backgrounds'];
const healthStatusOptions = ['Excellent', 'Very good', 'Good', 'Fair', 'Poor', 'Chronic condition', 'No MRI contraindications', 'No mobility restrictions', 'No implanted medical device', 'Pregnant or planning pregnancy', 'Currently taking prescription medication', 'Recent surgery', 'Vision impairment', 'Hearing impairment'];
const smokingOptions = ['Any', 'Never smoker', 'Former smoker', 'Current smoker', 'Vape / nicotine use'];
const answerKinds: EligibilityAnswerKind[] = ['yesNo', 'multipleChoice', 'range', 'locationRadius'];

function buildEligibilitySummary(criteria: EligibilityCriterion[]) {
  if (criteria.length === 0) {
    return 'No strict eligibility criteria beyond required study information.';
  }
  return criteria.map((criterion) => `${criterion.label}: ${criterion.value}`).join('; ');
}

export default function CreateStudyScreen() {
  const { createStudy, researcherProfile } = useRole();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [themeChoice, setThemeChoice] = useState<StudyTheme>('Neuroscience');
  const [rewardKind, setRewardKind] = useState<RewardKind>('Monetary');
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardOther, setRewardOther] = useState('');
  const [durationMins, setDurationMins] = useState('45');
  const [locationKind, setLocationKind] = useState<LocationKind>('Online');
  const [location, setLocation] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
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
  const [customQuestions, setCustomQuestions] = useState<CustomScreeningQuestion[]>([]);
  const [requiredInfoFields, setRequiredInfoFields] = useState<StudyFieldRequirement[]>(['ageRange']);

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

  const publishStudy = () => {
    if (!canPublish) {
      return;
    }

    const cleanDurationMins = parseNumber(durationMins);
    const mode = modeFromLocationKind(locationKind);
    const study: Study = {
      id: `s-${Date.now()}`,
      title: title.trim(),
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
      criteriaLocked: true,
      privacyStage: 'anonymous-eligible',
      isActive: true
    };

    createStudy(study);
    router.replace('/(researcher)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionHeader title="Create Study" subtitle="Use structured parameters so listings can be matched and filtered precisely." />
      <Card>
        <View style={styles.fields}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Study title" style={styles.input} />
          <TextInput value={summary} onChangeText={setSummary} placeholder="Short participant-facing summary" style={styles.input} multiline />
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
          <TextInput value={rewardAmount} onChangeText={setRewardAmount} keyboardType="numeric" placeholder="Amount" style={styles.input} />
        ) : null}
        {rewardKind === 'Other' ? (
          <TextInput value={rewardOther} onChangeText={setRewardOther} placeholder="Describe the reward" style={styles.input} />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Duration and location</Text>
        <TextInput value={durationMins} onChangeText={setDurationMins} keyboardType="numeric" placeholder="Duration in minutes" style={styles.input} />
        <View style={styles.chips}>
          {locationKinds.map((option) => (
            <FilterChip key={option} label={option} active={locationKind === option} onPress={() => setLocationKind(option)} />
          ))}
        </View>
        {needsLocationDetails ? (
          <>
            <TextInput value={location} onChangeText={setLocation} placeholder="Location address or city" style={styles.input} />
            <Text style={styles.note}>Map picker placeholder: this field is ready for a future maps API integration.</Text>
          </>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Locked eligibility criteria</Text>
        <Text style={styles.note}>Use typed selections and ranges. Criteria lock on publish so rejections must map to pre-existing rules.</Text>
        <Text style={styles.label}>Age range: {ageMin}–{ageMax}</Text>
        <View style={styles.rangeSelector}>
          <View style={styles.ageControl}>
            <Text style={styles.note}>Minimum</Text>
            <View style={styles.chips}>{ageOptions.filter((age) => age % 5 === 0 || age === 18).map((age) => <FilterChip key={`min-${age}`} label={`${age}`} active={ageMin === age} onPress={() => setAgeMin(Math.min(age, ageMax))} />)}</View>
          </View>
          <View style={styles.ageControl}>
            <Text style={styles.note}>Maximum</Text>
            <View style={styles.chips}>{ageOptions.filter((age) => age % 5 === 0 || age === 100).map((age) => <FilterChip key={`max-${age}`} label={`${age}`} active={ageMax === age} onPress={() => setAgeMax(Math.max(age, ageMin))} />)}</View>
          </View>
        </View>
        <Text style={styles.label}>Sex</Text>
        <View style={styles.chips}>{sexOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.sex === option} onPress={() => setEligibilityValues((current) => ({ ...current, sex: option }))} />)}</View>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips}>{genderOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.gender === option} onPress={() => setEligibilityValues((current) => ({ ...current, gender: option }))} />)}</View>
        <Text style={styles.label}>Race / ethnicity</Text>
        <View style={styles.chips}>{raceEthnicityOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.raceEthnicity === option} onPress={() => setEligibilityValues((current) => ({ ...current, raceEthnicity: option }))} />)}</View>
        <Pressable onPress={() => setHealthStatusMatters((current) => !current)} style={styles.requiredRow}><View style={[styles.checkbox, healthStatusMatters && styles.checkboxChecked]}>{healthStatusMatters ? <Text style={styles.checkboxTick}>✓</Text> : null}</View><Text style={styles.label}>Health status {healthStatusMatters ? '⌃' : '⌄'}</Text></Pressable>
        {healthStatusMatters ? <><View style={styles.chips}>{healthStatusOptions.map((option) => <FilterChip key={option} label={option} active={(eligibilityValues.healthStatus ?? '').split(', ').includes(option)} onPress={() => setEligibilityValues((current) => { const selected = (current.healthStatus ?? '').split(', ').filter(Boolean); const next = selected.includes(option) ? selected.filter((entry) => entry !== option) : [...selected, option]; return { ...current, healthStatus: next.join(', ') }; })} />)}</View><Text style={styles.label}>Smoking / nicotine</Text><View style={styles.chips}>{smokingOptions.map((option) => <FilterChip key={option} label={option} active={eligibilityValues.smokingStatus === option} onPress={() => setEligibilityValues((current) => ({ ...current, smokingStatus: option }))} />)}</View><TextInput value={eligibilityValues.medicalHistory ?? ''} onChangeText={(value) => setEligibilityValues((current) => ({ ...current, medicalHistory: value }))} placeholder="Specific medical history rule" style={styles.input} /></> : null}
        <TextInput value={eligibilityValues.distancePreference ?? ''} onChangeText={(value) => setEligibilityValues((current) => ({ ...current, distancePreference: value }))} placeholder="Location radius, e.g. within 25 km of Toronto" style={styles.input} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Custom screening question</Text>
        <Text style={styles.note}>Mintaro evaluates answers internally and initially reveals only eligibility, not raw answers.</Text>
        <TextInput value={customQuestion} onChangeText={setCustomQuestion} placeholder="Question shown to participants" style={styles.input} />
        <View style={styles.chips}>{answerKinds.map((kind) => <FilterChip key={kind} label={kind} active={customAnswerKind === kind} onPress={() => setCustomAnswerKind(kind)} />)}</View>
        {customAnswerKind === 'yesNo' ? <View style={styles.chips}><FilterChip label="Yes" active={customEligibleAnswer === 'yes'} onPress={() => setCustomEligibleAnswer('yes')} /><FilterChip label="No" active={customEligibleAnswer === 'no'} onPress={() => setCustomEligibleAnswer('no')} /></View> : null}
        {customAnswerKind === 'range' ? <View style={styles.inlineInputs}><TextInput value={customRangeMin} onChangeText={setCustomRangeMin} keyboardType="numeric" placeholder="Eligible min" style={[styles.input, styles.flexInput]} /><TextInput value={customRangeMax} onChangeText={setCustomRangeMax} keyboardType="numeric" placeholder="Eligible max" style={[styles.input, styles.flexInput]} /></View> : null}
        {customAnswerKind === 'locationRadius' ? <TextInput value={customRadius} onChangeText={setCustomRadius} keyboardType="numeric" placeholder="Eligible radius in km" style={styles.input} /> : null}
        {customAnswerKind === 'multipleChoice' ? <><View style={styles.inlineInputs}><TextInput value={customChoiceDraft} onChangeText={setCustomChoiceDraft} placeholder="Add answer choice" style={[styles.input, styles.flexInput]} /><Button title="Add" variant="secondary" onPress={() => { const choice = customChoiceDraft.trim(); if (!choice) return; setCustomChoices((current) => current.includes(choice) ? current : [...current, choice]); setCustomChoiceDraft(''); }} /></View><View style={styles.chips}>{customChoices.map((choice) => <FilterChip key={choice} label={choice} active={customEligibleAnswer === choice} onPress={() => setCustomEligibleAnswer(choice)} />)}</View></> : null}
        <Button title="Add screening question" variant="secondary" onPress={() => { if (!customQuestion.trim()) return; const eligibleAnswer = customAnswerKind === 'yesNo' ? customEligibleAnswer === 'yes' : customAnswerKind === 'range' ? { min: parseNumber(customRangeMin), max: parseNumber(customRangeMax) } : customAnswerKind === 'locationRadius' ? { radius: parseNumber(customRadius) } : customEligibleAnswer ? [customEligibleAnswer] : customChoices; setCustomQuestions((current) => [...current, { id: `cq-${Date.now()}`, question: customQuestion.trim(), answerKind: customAnswerKind, eligibleAnswer }]); setCustomQuestion(''); setCustomEligibleAnswer('yes'); setCustomRangeMin(''); setCustomRangeMax(''); setCustomRadius(''); setCustomChoices([]); }} />
        {customQuestions.map((question) => <Text key={question.id} style={styles.note}>• {question.question} ({question.answerKind}) — eligibility held internally</Text>)}
      </Card>

      <Card>
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
      </Card>
      <Button title="Publish study" onPress={publishStudy} disabled={!canPublish} />
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
  inlineInputs: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  flexInput: { flex: 1 }
});
