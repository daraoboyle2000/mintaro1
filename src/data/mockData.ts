import { Applicant, Study } from '@/types';

export const mockStudies: Study[] = [
  {
    id: 's1',
    title: 'Daily Fitness Habits Interview',
    shortDescription: 'Help researchers understand morning workout routines.',
    details:
      '45-minute recorded interview for adults who exercise at least twice a week. Participants receive a digital gift card.',
    reward: '$35',
    duration: '45 min',
    location: 'San Francisco, CA',
    mode: 'Remote',
    tags: ['Health', 'Interview', 'Adults 18+'],
    eligibilitySummary: 'Age 18-45, English-speaking, active lifestyle.'
  },
  {
    id: 's2',
    title: 'Mobile Banking Usability Study',
    shortDescription: 'Test new mobile banking flows with think-aloud tasks.',
    details:
      '60-minute moderated usability test focused on first-time transfer setup and bill payments.',
    reward: '$60',
    duration: '60 min',
    location: 'Online',
    mode: 'Remote',
    tags: ['Fintech', 'Usability', 'Remote'],
    eligibilitySummary: 'Current mobile banking user, age 21+, U.S. resident.'
  },
  {
    id: 's3',
    title: 'In-Person Grocery Shopping Diary',
    shortDescription: 'Share shopping decisions over one short in-store trip.',
    details:
      'Participants complete a 30-minute accompanied shopping session and answer follow-up questions.',
    reward: '$40',
    duration: '30 min',
    location: 'Oakland, CA',
    mode: 'In person',
    tags: ['Retail', 'In-person', 'Diary'],
    eligibilitySummary: 'Shop for household groceries at least once weekly.'
  }
];

export const mockApplicants: Applicant[] = [
  {
    id: 'a1',
    name: 'Jordan Blake',
    age: 28,
    status: 'Pending',
    studyId: 's1',
    summary: 'Runs 3x weekly and has prior interview-study experience.'
  },
  {
    id: 'a2',
    name: 'Amira Patel',
    age: 33,
    status: 'Accepted',
    studyId: 's2',
    summary: 'Heavy banking app user with experience testing prototypes.'
  },
  {
    id: 'a3',
    name: 'Noah Kim',
    age: 24,
    status: 'Rejected',
    studyId: 's3',
    summary: 'Limited in-person availability for planned time slots.'
  }
];
