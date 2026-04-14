export type Role = 'participant' | 'researcher';

export type Study = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  reward: string;
  duration: string;
  location: string;
  mode: 'Remote' | 'In person';
  tags: string[];
  eligibilitySummary: string;
};

export type Applicant = {
  id: string;
  name: string;
  age: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  studyId: string;
  summary: string;
};
