export type Role = 'participant' | 'researcher';

export type StudyFieldRequirement =
  | 'smoker'
  | 'ageRange'
  | 'sex'
  | 'gender'
  | 'raceEthnicity'
  | 'healthStatus'
  | 'smokingStatus'
  | 'medicalHistory'
  | 'distancePreference';

export type StudyTheme =
  | 'Neuroscience'
  | 'MRI / body scan'
  | 'Blood work'
  | 'Diet & nutrition'
  | 'Tool testing'
  | 'Fitness & movement'
  | 'Mental health'
  | 'Consumer behaviour'
  | 'Finance & fintech'
  | 'Sleep'
  | 'Other';

export type RewardKind = 'Monetary' | 'Voucher / gift card' | 'None' | 'Other';

export type LocationKind = 'Online' | 'In person' | 'Both';

export type EligibilityAnswerKind = 'range' | 'yesNo' | 'multipleChoice' | 'locationRadius';

export type EligibilityCriterion = {
  field: StudyFieldRequirement | 'customQuestion';
  label: string;
  value: string;
  answerKind?: EligibilityAnswerKind;
  locked?: boolean;
  minimumNecessaryOnly?: boolean;
};

export type CustomScreeningQuestion = {
  id: string;
  question: string;
  answerKind: EligibilityAnswerKind;
  eligibleAnswer: string | boolean | { min?: number; max?: number } | string[] | { radius?: number };
  requiredInfo?: string;
};

export type Study = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  reward: string;
  rewardValue: number;
  rewardKind: RewardKind;
  duration: string;
  durationMins: number;
  location: string;
  locationKind: LocationKind;
  mode: 'Remote' | 'In person' | 'Hybrid';
  tags: string[];
  theme: StudyTheme;
  eligibilitySummary: string;
  eligibilityCriteria: EligibilityCriterion[];
  requiredInfoFields: StudyFieldRequirement[];
  researcherFirstName: string;
  requiredProfileFields: StudyFieldRequirement[];
  customScreeningQuestions?: CustomScreeningQuestion[];
  criteriaLocked?: boolean;
  privacyStage?: 'anonymous-eligible' | 'booked-info-release';
  isActive?: boolean;
  isPublished?: boolean;
};

export type Applicant = {
  id: string;
  name: string;
  age: number;
  status: 'Applied' | 'Eligible' | 'Booked' | 'Rejected';
  studyId: string;
  summary: string;
  isNew?: boolean;
  unreadUpdates?: number;
};

export type ApplicationStatus = 'Accepted' | 'Booked' | 'Completed' | 'Rejected';

export type StudyApplication = {
  id: string;
  studyId: string;
  status: ApplicationStatus;
  unreadUpdates: number;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  studyId: string;
  from: 'participant' | 'researcher';
  message: string;
  sentAt: string;
};

export type ParticipantProfile = {
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  age?: number;
  smoker?: boolean;
  distancePreference?: 'online' | 'in-person' | 'any';
  avatarUri?: string;
  avatarScale?: number;
  avatarOffsetX?: number;
  avatarOffsetY?: number;
};

export type DevModePreset = 'account-made' | 'fresh-account';

export type ResearcherProfile = {
  firstName?: string;
  lastName?: string;
  institution?: string;
  focusAreas?: string[];
  defaultPayoutMethod?: 'Bank transfer' | 'Gift cards' | 'Institution-managed' | 'Other';
  notifications?: 'Email only' | 'Push only' | 'Email and push' | 'Off';
  avatarUri?: string;
  avatarScale?: number;
  avatarOffsetX?: number;
  avatarOffsetY?: number;
};
