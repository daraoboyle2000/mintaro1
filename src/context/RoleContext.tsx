import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { mockApplicants, mockApplications, mockMessages, mockStudies } from '@/data/mockData';
import {
  ChatMessage,
  DevModePreset,
  ParticipantProfile,
  ResearcherProfile,
  Role,
  Study,
  StudyApplication,
  StudyFieldRequirement,
  Applicant
} from '@/types';
import { withCalculatedAge } from '@/utils/profile';

type RoleContextValue = {
  role: Role | null;
  setRole: (role: Role | null) => void;
  profile: ParticipantProfile;
  setProfile: (updater: (profile: ParticipantProfile) => ParticipantProfile) => void;
  researcherProfile: ResearcherProfile;
  setResearcherProfile: (updater: ResearcherProfile | ((profile: ResearcherProfile) => ResearcherProfile)) => void;
  applications: StudyApplication[];
  studies: Study[];
  applicants: Applicant[];
  createStudy: (study: Study) => void;
  updateStudy: (study: Study) => void;
  setStudyActive: (studyId: string, isActive: boolean) => void;
  deleteStudy: (studyId: string) => void;
  applyToStudy: (study: Study) => void;
  messages: ChatMessage[];
  sendMessage: (studyId: string, text: string, from?: 'participant' | 'researcher') => void;
  unreadMyStudiesCount: number;
  unreadResearcherUpdatesCount: number;
  markResearcherStudyRead: (studyId: string) => void;
  markMyStudiesRead: () => void;
  devModePreset: DevModePreset;
  setDevModePreset: (preset: DevModePreset) => void;
  hydrateByPreset: (preset: DevModePreset) => void;
  missingFieldsForStudy: (study: Study) => StudyFieldRequirement[];
  isParticipantSetupComplete: boolean;
  isResearcherSetupComplete: boolean;
};

const defaultProfile: ParticipantProfile = {
  firstName: 'Dara',
  lastName: 'Okafor',
  dateOfBirth: '14/04/1995',
  age: undefined,
  smoker: false,
  distancePreference: 'any'
};

const emptyProfile: ParticipantProfile = {
  firstName: 'New',
  lastName: undefined,
  dateOfBirth: undefined,
  age: undefined,
  smoker: undefined,
  distancePreference: undefined
};

const defaultResearcherProfile: ResearcherProfile = {
  firstName: 'Lena',
  lastName: 'Morris',
  institution: 'Northstar Research',
  focusAreas: ['Healthcare UX', 'Fintech'],
  defaultPayoutMethod: 'Bank transfer',
  notifications: 'Email and push'
};

const emptyResearcherProfile: ResearcherProfile = {
  firstName: undefined,
  lastName: undefined,
  institution: undefined,
  focusAreas: [],
  defaultPayoutMethod: undefined,
  notifications: undefined
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function withDefaultStudies(currentStudies: Study[] = []) {
  const existingIds = new Set(currentStudies.map((study) => study.id));
  return [...currentStudies, ...mockStudies.filter((study) => !existingIds.has(study.id))];
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfileState] = useState<ParticipantProfile>(defaultProfile);
  const [researcherProfile, setResearcherProfileState] = useState<ResearcherProfile>(defaultResearcherProfile);
  const [applications, setApplications] = useState<StudyApplication[]>(mockApplications);
  const [studies, setStudies] = useState<Study[]>(() => withDefaultStudies());
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [devModePreset, setDevModePreset] = useState<DevModePreset>('account-made');

  const setProfile = (updater: (profile: ParticipantProfile) => ParticipantProfile) => {
    setProfileState((current) => withCalculatedAge(updater(current)));
  };

  const setResearcherProfile = (updater: ResearcherProfile | ((profile: ResearcherProfile) => ResearcherProfile)) => {
    setResearcherProfileState((current) =>
      typeof updater === 'function' ? (updater as (profile: ResearcherProfile) => ResearcherProfile)(current) : updater
    );
  };

  const createStudy = (study: Study) => {
    setStudies((current) => (current.some((entry) => entry.id === study.id) ? current.map((entry) => (entry.id === study.id ? study : entry)) : [study, ...current]));
  };

  const updateStudy = (study: Study) => {
    setStudies((current) => current.map((entry) => (entry.id === study.id ? study : entry)));
  };

  const setStudyActive = (studyId: string, isActive: boolean) => {
    setStudies((current) =>
      current.map((study) => (study.id === studyId && study.isPublished !== false ? { ...study, isActive } : study))
    );
  };

  const deleteStudy = (studyId: string) => {
    setStudies((current) => current.filter((study) => study.id !== studyId));
    setApplicants((current) => current.filter((applicant) => applicant.studyId !== studyId));
    setApplications((current) => current.filter((application) => application.studyId !== studyId));
    setMessages((current) => current.filter((message) => message.studyId !== studyId));
  };

  const applyToStudy = (study: Study) => {
    setApplications((current) => {
      if (current.some((entry) => entry.studyId === study.id && entry.status !== 'Rejected')) {
        return current;
      }
      return [
        {
          id: `ap-${study.id}-${Date.now()}`,
          studyId: study.id,
          status: 'Accepted',
          unreadUpdates: 1,
          updatedAt: new Date().toISOString().slice(0, 10)
        },
        ...current
      ];
    });
  };

  const markMyStudiesRead = useCallback(() => {
    setApplications((current) => {
      if (current.every((entry) => entry.unreadUpdates === 0)) {
        return current;
      }
      return current.map((entry) => ({ ...entry, unreadUpdates: 0 }));
    });
  }, []);

  const sendMessage = (studyId: string, text: string, from: 'participant' | 'researcher' = 'participant') => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setMessages((current) => [
      ...current,
      {
        id: `m-${Date.now()}`,
        studyId,
        from,
        message: trimmed,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      }
    ]);
  };

  const missingFieldsForStudy = (study: Study) => {
    return study.requiredProfileFields.filter((field) => {
      if (field === 'smoker' || field === 'smokingStatus') {
        return typeof profile.smoker !== 'boolean';
      }
      if (field === 'ageRange') {
        return typeof withCalculatedAge(profile).age !== 'number';
      }
      if (field === 'distancePreference') {
        return !profile.distancePreference;
      }
      return false;
    });
  };

  const hydrateByPreset = (preset: DevModePreset) => {
    setDevModePreset(preset);
    if (preset === 'fresh-account') {
      setProfileState(emptyProfile);
        setResearcherProfileState(emptyResearcherProfile);
      setApplications([]);
      setMessages([]);
      setApplicants([]);
      setStudies(() => withDefaultStudies());
      return;
    }
    setProfileState(withCalculatedAge(defaultProfile));
    setResearcherProfileState(defaultResearcherProfile);
    setApplications(mockApplications);
    setMessages(mockMessages);
    setApplicants(mockApplicants);
    setStudies(() => withDefaultStudies());
  };

  const unreadResearcherUpdatesCount = useMemo(
    () => applicants.reduce((sum, entry) => sum + (entry.unreadUpdates ?? (entry.isNew ? 1 : 0)), 0),
    [applicants]
  );

  const markResearcherStudyRead = useCallback((studyId: string) => {
    setApplicants((current) =>
      current.map((entry) => (entry.studyId === studyId ? { ...entry, isNew: false, unreadUpdates: 0 } : entry))
    );
  }, []);

  const unreadMyStudiesCount = useMemo(
    () => applications.reduce((sum, entry) => sum + entry.unreadUpdates, 0),
    [applications]
  );


  const isParticipantSetupComplete = Boolean(
    profile.firstName &&
      profile.firstName !== 'New' &&
      profile.lastName &&
      typeof withCalculatedAge(profile).age === 'number'
  );

  const isResearcherSetupComplete = Boolean(
    researcherProfile.firstName &&
      researcherProfile.lastName &&
      researcherProfile.institution &&
      researcherProfile.focusAreas?.length &&
      researcherProfile.defaultPayoutMethod &&
      researcherProfile.notifications
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      profile,
      setProfile,
      researcherProfile,
      setResearcherProfile,
      applications,
      studies,
      applicants,
      createStudy,
      updateStudy,
      setStudyActive,
      deleteStudy,
      applyToStudy,
      messages,
      sendMessage,
      unreadMyStudiesCount,
      unreadResearcherUpdatesCount,
      markMyStudiesRead,
      markResearcherStudyRead,
      devModePreset,
      setDevModePreset,
      hydrateByPreset,
      missingFieldsForStudy,
      isParticipantSetupComplete,
      isResearcherSetupComplete
    }),
    [role, profile, researcherProfile, applications, studies, applicants, messages, unreadMyStudiesCount, unreadResearcherUpdatesCount, markMyStudiesRead, markResearcherStudyRead, devModePreset, isParticipantSetupComplete, isResearcherSetupComplete]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used inside RoleProvider');
  }
  return context;
}
