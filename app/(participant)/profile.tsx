import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';

export default function ParticipantProfileScreen() {
  const { profile, setProfile } = useRole();
  const [photoInput, setPhotoInput] = useState(profile.avatarUri ?? '');

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

          <TextInput
            style={styles.input}
            placeholder="Paste image URL"
            value={photoInput}
            onChangeText={setPhotoInput}
          />
          <Button
            title="Update profile photo"
            variant="secondary"
            onPress={() => setProfile((current) => ({ ...current, avatarUri: photoInput || undefined }))}
          />
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
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontSize: theme.typography.h1, color: theme.colors.primaryDark, fontWeight: '700' },
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
