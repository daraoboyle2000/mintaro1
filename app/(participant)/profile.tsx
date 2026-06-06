import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ParticipantProfileScreen() {
  const { profile, setProfile } = useRole();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Your Profile" subtitle="Manage participant details and preferences" />
      <Card>
        <View style={styles.avatarWrap}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{(profile.firstName || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.photoHint}>Profile photo</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={profile.firstName}
            onChangeText={(value) => setProfile((current) => ({ ...current, firstName: value }))}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Second name</Text>
          <TextInput
            style={styles.input}
            value={profile.lastName ?? ''}
            onChangeText={(value) => setProfile((current) => ({ ...current, lastName: value }))}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={styles.input}
            value={profile.dateOfBirth ?? ''}
            onChangeText={(value) => setProfile((current) => ({ ...current, dateOfBirth: value }))}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={profile.age ? `${profile.age}` : ''}
            onChangeText={(value) =>
              setProfile((current) => ({ ...current, age: value ? Number(value) : undefined }))
            }
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  avatarWrap: { alignItems: 'center', gap: theme.spacing.sm },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF9F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff' },
  avatarText: { fontSize: theme.typography.h1, color: theme.colors.primaryDark, fontWeight: '700' },
  photoHint: { color: theme.colors.textSecondary, fontSize: theme.typography.caption },
  row: { gap: theme.spacing.xs },
  label: { color: theme.colors.textSecondary },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  }
});
