import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateWheelPicker } from '@/components/ui/DateWheelPicker';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';
import { ResearcherProfile } from '@/types';
import { calculateAge } from '@/utils/profile';

const participantTutorialSteps = [
  { title: 'Browse matched studies', text: 'Use search and filters to find paid research studies that fit your profile, schedule, and location.' },
  { title: 'Apply with confidence', text: 'Tap Apply on a study you like. If a study needs extra eligibility info, Mintaro will ask before sending it.' },
  { title: 'Track everything in My Studies', text: 'Your applications, accepted sessions, updates, and researcher messages all live in My Studies.' }
];

const researcherTutorialSteps = [
  { title: 'Create structured studies', text: 'Publish studies with theme, reward, duration, location, eligibility criteria, and required-info fields.' },
  { title: 'Review applicants in My Studies', text: 'Each study has Applied, Accepted, and Rejected tabs plus notification counters for new applicants.' },
  { title: 'Chat after acceptance', text: 'Accepted applicants show a chat icon so you can coordinate session details directly.' }
];

const focusAreaOptions = ['Neuroscience', 'MRI / body scan', 'Blood work', 'Diet & nutrition', 'Tool testing', 'Fintech', 'Mental health'];
const payoutOptions: NonNullable<ResearcherProfile['defaultPayoutMethod']>[] = ['Bank transfer', 'Gift cards', 'Institution-managed', 'Other'];
const notificationOptions: NonNullable<ResearcherProfile['notifications']>[] = ['Email and push', 'Email only', 'Push only', 'Off'];

export default function AccountSetupScreen() {
  const { role, profile, researcherProfile, setProfile, setResearcherProfile } = useRole();
  const [firstName, setFirstName] = useState(role === 'researcher' ? researcherProfile.firstName ?? '' : profile.firstName === 'New' ? '' : profile.firstName);
  const [lastName, setLastName] = useState(role === 'researcher' ? researcherProfile.lastName ?? '' : profile.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? '');
  const [institution, setInstitution] = useState(researcherProfile.institution ?? '');
  const [focusAreas, setFocusAreas] = useState<string[]>(researcherProfile.focusAreas ?? []);
  const [defaultPayoutMethod, setDefaultPayoutMethod] = useState<ResearcherProfile['defaultPayoutMethod']>(researcherProfile.defaultPayoutMethod);
  const [notifications, setNotifications] = useState<ResearcherProfile['notifications']>(researcherProfile.notifications);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialIndex, setTutorialIndex] = useState(0);

  const isResearcher = role === 'researcher';
  const tutorialSteps = isResearcher ? researcherTutorialSteps : participantTutorialSteps;
  const canContinue = isResearcher
    ? Boolean(firstName.trim() && lastName.trim() && institution.trim() && focusAreas.length && defaultPayoutMethod && notifications)
    : Boolean(firstName.trim() && lastName.trim() && typeof calculateAge(dateOfBirth) === 'number');
  const currentStep = tutorialSteps[tutorialIndex];

  const toggleFocusArea = (area: string) => {
    setFocusAreas((current) => (current.includes(area) ? current.filter((entry) => entry !== area) : [...current, area]));
  };

  const saveBasics = () => {
    if (!canContinue) {
      return;
    }

    if (isResearcher) {
      setResearcherProfile((current) => ({
        ...current,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        institution: institution.trim(),
        focusAreas,
        defaultPayoutMethod,
        notifications
      }));
      setShowTutorial(true);
      return;
    }

    setProfile((current) => ({ ...current, firstName: firstName.trim(), lastName: lastName.trim(), dateOfBirth: dateOfBirth.trim() }));
    setShowTutorial(true);
  };

  const finishSetup = () => {
    router.replace(isResearcher ? '/(researcher)' : '/(participant)');
  };

  if (!role) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!showTutorial ? (
          <>
            <SectionHeader
              title="Set up your account"
              subtitle={isResearcher ? 'Add your researcher workspace settings before publishing studies.' : 'Add your basic details before browsing studies.'}
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
              {!isResearcher ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Date of birth</Text>
                  <DateWheelPicker value={dateOfBirth} onChange={setDateOfBirth} />
                </View>
              ) : null}
              {isResearcher ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Research institution</Text>
                    <TextInput value={institution} onChangeText={setInstitution} placeholder="University, lab, or company" style={styles.input} />
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Focus areas</Text>
                    <View style={styles.chips}>{focusAreaOptions.map((area) => <FilterChip key={area} label={area} active={focusAreas.includes(area)} onPress={() => toggleFocusArea(area)} />)}</View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Default payout method</Text>
                    <View style={styles.chips}>{payoutOptions.map((option) => <FilterChip key={option} label={option} active={defaultPayoutMethod === option} onPress={() => setDefaultPayoutMethod(option)} />)}</View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Notifications</Text>
                    <View style={styles.chips}>{notificationOptions.map((option) => <FilterChip key={option} label={option} active={notifications === option} onPress={() => setNotifications(option)} />)}</View>
                  </View>
                </>
              ) : null}
            </Card>
            <Button title="Continue" onPress={saveBasics} disabled={!canContinue} />
          </>
        ) : (
          <>
            <SectionHeader title="Quick tour" subtitle={isResearcher ? 'A few tips before you manage studies.' : 'A few tips before you start applying.'} />
            <Card>
              <Text style={styles.stepCounter}>Step {tutorialIndex + 1} of {tutorialSteps.length}</Text>
              <Text style={styles.tutorialTitle}>{currentStep.title}</Text>
              <Text style={styles.tutorialText}>{currentStep.text}</Text>
            </Card>
            <View style={styles.dots}>{tutorialSteps.map((step, index) => <View key={step.title} style={[styles.dot, index === tutorialIndex && styles.activeDot]} />)}</View>
            <Button
              title={tutorialIndex === tutorialSteps.length - 1 ? (isResearcher ? 'Open My Studies' : 'Start browsing') : 'Next'}
              onPress={() => {
                if (tutorialIndex === tutorialSteps.length - 1) {
                  finishSetup();
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  stepCounter: { color: theme.colors.primaryDark, fontWeight: '700' },
  tutorialTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h2, fontWeight: '700' },
  tutorialText: { color: theme.colors.textSecondary, lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm },
  dot: { width: 9, height: 9, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border },
  activeDot: { width: 24, backgroundColor: theme.colors.primary }
});
