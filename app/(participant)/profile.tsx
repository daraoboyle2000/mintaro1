declare const require: (moduleName: string) => any;

import { useRef, useState } from 'react';
import { Image, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateWheelPicker } from '@/components/ui/DateWheelPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';
import { calculateAge } from '@/utils/profile';

const AVATAR_SIZE = 132;

type DraftAvatar = {
  uri: string;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export default function ParticipantProfileScreen() {
  const { profile, setProfile } = useRole();
  const [draftAvatar, setDraftAvatar] = useState<DraftAvatar | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const calculatedAge = calculateAge(profile.dateOfBirth);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => Boolean(draftAvatar),
    onPanResponderGrant: () => {
      panStart.current = { x: draftAvatar?.offsetX ?? 0, y: draftAvatar?.offsetY ?? 0 };
    },
    onPanResponderMove: (_event, gesture) => {
      setDraftAvatar((current) =>
        current
          ? {
              ...current,
              offsetX: panStart.current.x + gesture.dx,
              offsetY: panStart.current.y + gesture.dy
            }
          : current
      );
    }
  });

  const openGallery = async () => {
    const ImagePicker = require('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setDraftAvatar({
        uri: result.assets[0].uri,
        scale: profile.avatarScale ?? 1,
        offsetX: profile.avatarOffsetX ?? 0,
        offsetY: profile.avatarOffsetY ?? 0
      });
    }
  };

  const saveAvatar = () => {
    if (!draftAvatar) {
      return;
    }

    setProfile((current) => ({
      ...current,
      avatarUri: draftAvatar.uri,
      avatarScale: draftAvatar.scale,
      avatarOffsetX: draftAvatar.offsetX,
      avatarOffsetY: draftAvatar.offsetY
    }));
    setDraftAvatar(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionHeader title="Your Profile" subtitle="Manage participant details and preferences" />
      <Card>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarFrame}>
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={[
                  styles.avatarImage,
                  {
                    transform: [
                      { translateX: profile.avatarOffsetX ?? 0 },
                      { translateY: profile.avatarOffsetY ?? 0 },
                      { scale: profile.avatarScale ?? 1 }
                    ]
                  }
                ]}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{(profile.firstName || 'U').charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Button title="Upload profile picture" variant="secondary" onPress={openGallery} />
          <Text style={styles.photoHint}>Pick an image, then zoom and move it inside the circle.</Text>
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
          <DateWheelPicker
            value={profile.dateOfBirth ?? ''}
            onChange={(dateOfBirth) => setProfile((current) => ({ ...current, dateOfBirth }))}
          />
        </View>
        <View style={styles.ageCard}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.ageValue}>{typeof calculatedAge === 'number' ? calculatedAge : 'Select your date of birth'}</Text>
        </View>
      </Card>

      <Modal visible={Boolean(draftAvatar)} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.editorCard}>
            <Text style={styles.editorTitle}>Position your profile picture</Text>
            <Text style={styles.editorText}>Drag the photo to move it. Use zoom to fit your face inside the circle.</Text>
            <View style={styles.editorAvatarFrame} {...panResponder.panHandlers}>
              {draftAvatar ? (
                <Image
                  source={{ uri: draftAvatar.uri }}
                  style={[
                    styles.editorImage,
                    {
                      transform: [
                        { translateX: draftAvatar.offsetX },
                        { translateY: draftAvatar.offsetY },
                        { scale: draftAvatar.scale }
                      ]
                    }
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.zoomRow}>
              <Button
                title="Zoom out"
                variant="secondary"
                onPress={() => setDraftAvatar((current) => (current ? { ...current, scale: Math.max(1, current.scale - 0.1) } : current))}
              />
              <Button
                title="Zoom in"
                variant="secondary"
                onPress={() => setDraftAvatar((current) => (current ? { ...current, scale: Math.min(2.4, current.scale + 0.1) } : current))}
              />
            </View>
            <View style={styles.zoomRow}>
              <Button title="Cancel" variant="secondary" onPress={() => setDraftAvatar(null)} />
              <Button title="Save photo" onPress={saveAvatar} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  avatarWrap: { alignItems: 'center', gap: theme.spacing.sm },
  avatarFrame: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#EAF9F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF9F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: { width: 88, height: 88, backgroundColor: '#fff' },
  avatarText: { fontSize: theme.typography.h1, color: theme.colors.primaryDark, fontWeight: '700' },
  photoHint: { color: theme.colors.textSecondary, fontSize: theme.typography.caption, textAlign: 'center' },
  row: { gap: theme.spacing.xs },
  label: { color: theme.colors.textSecondary, fontWeight: '600' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#fff'
  },
  ageCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: '#F4FBF8',
    gap: theme.spacing.xs
  },
  ageValue: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: theme.typography.h3 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  editorCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  editorTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '800', textAlign: 'center' },
  editorText: { color: theme.colors.textSecondary, textAlign: 'center' },
  editorAvatarFrame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#EAF9F2',
    borderWidth: 4,
    borderColor: '#D3F3E4'
  },
  editorImage: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  zoomRow: { flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'center' }
});
