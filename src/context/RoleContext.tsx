import React, { createContext, useContext, useMemo, useState } from 'react';

import { Role } from '@/types';

type RoleContextValue = {
  role: Role | null;
  setRole: (role: Role | null) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used inside RoleProvider');
  }
  return context;
}
