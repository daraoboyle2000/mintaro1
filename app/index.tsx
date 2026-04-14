import { Redirect } from 'expo-router';

import { useRole } from '@/context/RoleContext';

export default function Index() {
  const { role } = useRole();

  if (!role) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return role === 'participant' ? (
    <Redirect href="/(participant)" />
  ) : (
    <Redirect href="/(researcher)" />
  );
}
