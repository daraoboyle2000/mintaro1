import React, { createContext, useContext, useMemo, useState } from 'react';

import { mockApplications, mockMessages } from '@/data/mockData';
import {
  ChatMessage,
  DevModePreset,
  ParticipantProfile,
  Role,
  Study,
  StudyApplication,
  StudyFieldRequirement
} from '@/types';

type RoleContextValue = {
  role: Role | null;
  setRole: (role: Role | null) => void;
  profile: ParticipantProfile;
  setProfile: (updater: (profile: ParticipantProfile) => ParticipantProfile) => void;
  applications: StudyApplication[];
  applyToStudy: (study: Study) => void;
  messages: ChatMessage[];
  sendMessage: (studyId: string, text: string) => void;
  unreadMyStudiesCount: number;
  devModePreset: DevModePreset;
  setDevModePreset: (preset: DevModePreset) => void;
  hydrateByPreset: (preset: DevModePreset) => void;
  missingFieldsForStudy: (study: Study) => StudyFieldRequirement[];
};

const defaultProfile: ParticipantProfile = {
  firstName: 'Dara',
  age: 29,
  smoker: false,
  distancePreference: 'any'
};

const emptyProfile: ParticipantProfile = {
  firstName: 'New',
  age: undefined,
  smoker: undefined,
  distancePreference: undefined
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfileState] = useState<ParticipantProfile>(defaultProfile);
  const [applications, setApplications] = useState<StudyApplication[]>(mockApplications);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [devModePreset, setDevModePreset] = useState<DevModePreset>('account-made');

  const setProfile = (updater: (profile: ParticipantProfile) => ParticipantProfile) => {
    setProfileState((current) => updater(current));
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
          status: 'Applied',
          unreadUpdates: 1,
          updatedAt: new Date().toISOString().slice(0, 10)
        },
        ...current
      ];
    });
  };

  const sendMessage = (studyId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setMessages((current) => [
      ...current,
      {
        id: `m-${Date.now()}`,
        studyId,
        from: 'participant',
        message: trimmed,
        sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      }
    ]);
  };

  const missingFieldsForStudy = (study: Study) => {
    return study.requiredProfileFields.filter((field) => {
      if (field === 'smoker') {
        return typeof profile.smoker !== 'boolean';
      }
      if (field === 'ageRange') {
        return typeof profile.age !== 'number';
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
      setApplications([]);
      setMessages([]);
      return;
    }
    setProfileState(defaultProfile);
    setApplications(mockApplications);
    setMessages(mockMessages);
  };

  const unreadMyStudiesCount = useMemo(
    () => applications.reduce((sum, entry) => sum + entry.unreadUpdates, 0),
    [applications]
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      profile,
      setProfile,
      applications,
      applyToStudy,
      messages,
      sendMessage,
      unreadMyStudiesCount,
      devModePreset,
      setDevModePreset,
      hydrateByPreset,
      missingFieldsForStudy
    }),
    [role, profile, applications, messages, unreadMyStudiesCount, devModePreset]
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
