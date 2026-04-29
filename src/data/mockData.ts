import { Applicant, ChatMessage, Study, StudyApplication } from '@/types';

export const mockStudies: Study[] = [
  {
    id: 's1',
    title: 'Daily Fitness Habits Interview',
    shortDescription: 'Help researchers understand morning workout routines.',
    details:
      '45-minute recorded interview for adults who exercise at least twice a week. Participants receive a digital gift card.',
    reward: '$35',
    rewardValue: 35,
    duration: '45 min',
    durationMins: 45,
    location: 'San Francisco, CA',
    mode: 'Remote',
    tags: ['Health', 'Interview', 'Adults 18+'],
    eligibilitySummary: 'Age 18-45, English-speaking, active lifestyle.',
    researcherFirstName: 'Lena',
    requiredProfileFields: ['ageRange']
  },
  {
    id: 's2',
    title: 'Mobile Banking Usability Study',
    shortDescription: 'Test new mobile banking flows with think-aloud tasks.',
    details:
      '60-minute moderated usability test focused on first-time transfer setup and bill payments.',
    reward: '$60',
    rewardValue: 60,
    duration: '60 min',
    durationMins: 60,
    location: 'Online',
    mode: 'Remote',
    tags: ['Fintech', 'Usability', 'Remote'],
    eligibilitySummary: 'Current mobile banking user, age 21+, U.S. resident.',
    researcherFirstName: 'Marco',
    requiredProfileFields: ['ageRange', 'distancePreference']
  },
  {
    id: 's3',
    title: 'In-Person Grocery Shopping Diary',
    shortDescription: 'Share shopping decisions over one short in-store trip.',
    details:
      'Participants complete a 30-minute accompanied shopping session and answer follow-up questions.',
    reward: '$40',
    rewardValue: 40,
    duration: '30 min',
    durationMins: 30,
    location: 'Oakland, CA',
    mode: 'In person',
    tags: ['Retail', 'In-person', 'Diary'],
    eligibilitySummary: 'Shop for household groceries at least once weekly.',
    researcherFirstName: 'Ava',
    requiredProfileFields: ['smoker']
  }
];

export const mockApplicants: Applicant[] = [
  {
    id: 'a1',
    name: 'Jordan Blake',
    age: 28,
    status: 'Pending',
    studyId: 's1',
    summary: 'Runs 3x weekly and has prior interview-study experience.',
    isNew: true
  },
  {
    id: 'a2',
    name: 'Amira Patel',
    age: 33,
    status: 'Accepted',
    studyId: 's2',
    summary: 'Heavy banking app user with experience testing prototypes.',
    isNew: false
  },
  {
    id: 'a3',
    name: 'Noah Kim',
    age: 24,
    status: 'Rejected',
    studyId: 's3',
    summary: 'Limited in-person availability for planned time slots.',
    isNew: true
  }
];

export const mockApplications: StudyApplication[] = [
  { id: 'ap1', studyId: 's1', status: 'Applied', unreadUpdates: 0, updatedAt: '2026-04-20' },
  { id: 'ap2', studyId: 's2', status: 'Accepted', unreadUpdates: 2, updatedAt: '2026-04-23' },
  { id: 'ap3', studyId: 's3', status: 'Rejected', unreadUpdates: 1, updatedAt: '2026-04-21' }
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    studyId: 's2',
    from: 'researcher',
    message: 'You are accepted. Please select a session slot.',
    sentAt: '2026-04-23 10:30'
  },
  {
    id: 'm2',
    studyId: 's2',
    from: 'participant',
    message: 'Thanks! Tuesday 4pm works for me.',
    sentAt: '2026-04-23 11:15'
  }
];
