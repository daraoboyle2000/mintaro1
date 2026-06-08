import { LocationKind, RewardKind, StudyFieldRequirement, StudyTheme } from '@/types';

export const studyThemes: StudyTheme[] = [
  'Neuroscience',
  'MRI / body scan',
  'Blood work',
  'Diet & nutrition',
  'Tool testing',
  'Fitness & movement',
  'Mental health',
  'Consumer behaviour',
  'Finance & fintech',
  'Sleep',
  'Other'
];

export const rewardKinds: RewardKind[] = ['Monetary', 'Voucher / gift card', 'None', 'Other'];

export const locationKinds: LocationKind[] = ['Online', 'In person', 'Both'];

export const eligibilityFields: Array<{
  field: StudyFieldRequirement;
  label: string;
  inputHint: string;
  group: 'Basics' | 'Identity' | 'Health' | 'Location';
}> = [
  { field: 'ageRange', label: 'Age', inputHint: 'e.g. 18-45', group: 'Basics' },
  { field: 'sex', label: 'Sex', inputHint: 'e.g. Female, Male, Intersex, any', group: 'Identity' },
  { field: 'gender', label: 'Gender', inputHint: 'e.g. Women, non-binary people, any', group: 'Identity' },
  { field: 'raceEthnicity', label: 'Race / ethnicity', inputHint: 'e.g. Hispanic/Latine, any', group: 'Identity' },
  { field: 'healthStatus', label: 'General health status', inputHint: 'e.g. Healthy adults, chronic condition', group: 'Health' },
  { field: 'smokingStatus', label: 'Smoking status', inputHint: 'e.g. non-smoker, current smoker', group: 'Health' },
  { field: 'medicalHistory', label: 'Medical history', inputHint: 'e.g. history of migraines, no MRI contraindications', group: 'Health' },
  { field: 'distancePreference', label: 'Location preference', inputHint: 'e.g. within 10 miles, online only', group: 'Location' }
];
