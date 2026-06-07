import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateWheelPicker } from '@/components/ui/DateWheelPicker';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';
import { calculateAge } from '@/utils/profile';

const tutorialSteps = [
  {
    title: 'Browse matched studies',
    text: 'Use search and filters to find paid research studies that fit your profile, schedule, and location.'
  },
  {
    title: 'Apply with confidence',
    text: 'Tap Apply on a study you like. If a study needs extra eligibility info, Mintaro will ask before sending it.'
  },
  {
    title: 'Track everything in My Studies',
    text: 'Your applications, accepted sessions, updates, and researcher messages all live in My Studies.'
  }
];

export default function AccountSetupScreen() {
  const { role, profile, setProfile, setResearcherProfile } = useRole();
  const [firstName, setFirstName] = useState(profile.firstName === 'New' ? '' : profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? '');
  const [institution, setInstitution] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialIndex, setTutorialIndex] = useState(0);

  const isResearcher = role === 'researcher';
  const canContinue = firstName.trim() && lastName.trim() && typeof calculateAge(dateOfBirth) === 'number' && (!isResearcher || institution.trim());
  const currentStep = tutorialSteps[tutorialIndex];

  const saveBasics = () => {
    if (!canContinue) {
      return;
    }

    setProfile((current) => ({
      ...current,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth.trim()
    }));

    if (isResearcher) {
      setResearcherProfile({ institution: institution.trim() });
      router.replace('/(researcher)');
      return;
    }

    setShowTutorial(true);
  };

  const finishParticipantSetup = () => {
    router.replace('/(participant)');
  };

  if (!role) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.container}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!showTutorial ? (
        <>
          <SectionHeader
            title="Set up your account"
            subtitle={isResearcher ? 'Add your basic details and research institution.' : 'Add your basic details before browsing studies.'}
          />
          <Card>
            <View style={styles.row}>
              <Text style={styles.label}>First name</Text>
              <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name" style={styles.input} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Second name</Text>
              <TextInput value={lastName} onChangeText={setLastName} placeholder="Second name" style={styles.input} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of birth</Text>
              <DateWheelPicker value={dateOfBirth} onChange={setDateOfBirth} />
            </View>
            {isResearcher ? (
              <View style={styles.row}>
                <Text style={styles.label}>Research institution</Text>
                <TextInput
                  value={institution}
                  onChangeText={setInstitution}
                  placeholder="University, lab, or company"
                  style={styles.input}
                />
              </View>
            ) : null}
          </Card>
          <Button title={isResearcher ? 'Finish setup' : 'Continue'} onPress={saveBasics} disabled={!canContinue} />
        </>
      ) : (
        <>
          <SectionHeader title="Quick tour" subtitle="A few tips before you start applying." />
          <Card>
            <Text style={styles.stepCounter}>Step {tutorialIndex + 1} of {tutorialSteps.length}</Text>
            <Text style={styles.tutorialTitle}>{currentStep.title}</Text>
            <Text style={styles.tutorialText}>{currentStep.text}</Text>
          </Card>
          <View style={styles.dots}>
            {tutorialSteps.map((step, index) => (
              <View key={step.title} style={[styles.dot, index === tutorialIndex && styles.activeDot]} />
            ))}
          </View>
          <Button
            title={tutorialIndex === tutorialSteps.length - 1 ? 'Start browsing' : 'Next'}
            onPress={() => {
              if (tutorialIndex === tutorialSteps.length - 1) {
                finishParticipantSetup();
                return;
              }
              setTutorialIndex((current) => current + 1);
            }}
          />
        </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.lg },
  row: { gap: theme.spacing.xs },
  label: { color: theme.colors.textSecondary, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body,
    backgroundColor: '#fff'
  },
  stepCounter: { color: theme.colors.primaryDark, fontWeight: '700' },
  tutorialTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h2, fontWeight: '700' },
  tutorialText: { color: theme.colors.textSecondary, lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm },
  dot: { width: 9, height: 9, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border },
  activeDot: { width: 24, backgroundColor: theme.colors.primary }
});
