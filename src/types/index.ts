export type Role = 'participant' | 'researcher';

export type StudyFieldRequirement = 'smoker' | 'ageRange' | 'distancePreference';

export type Study = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  reward: string;
  rewardValue: number;
  duration: string;
  durationMins: number;
  location: string;
  mode: 'Remote' | 'In person' | 'Hybrid';
  tags: string[];
  eligibilitySummary: string;
  researcherFirstName: string;
  requiredProfileFields: StudyFieldRequirement[];
};

export type Applicant = {
  id: string;
  name: string;
  age: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  studyId: string;
  summary: string;
  isNew?: boolean;
};

export type ApplicationStatus = 'Applied' | 'Accepted' | 'Completed' | 'Rejected';

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
  age?: number;
  smoker?: boolean;
  distancePreference?: 'online' | 'in-person' | 'any';
  avatarUri?: string;
};

export type DevModePreset = 'account-made' | 'fresh-account';
