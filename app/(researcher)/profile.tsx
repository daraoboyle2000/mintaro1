declare const require: (moduleName: string) => any;

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { theme } from '@/theme';
import { ResearcherProfile } from '@/types';

const windowSize = Dimensions.get('window');
const AVATAR_SIZE = Math.min(windowSize.width - 32, windowSize.height - 260);
const focusAreaOptions = ['Neuroscience', 'MRI / body scan', 'Blood work', 'Diet & nutrition', 'Tool testing', 'Fintech', 'Mental health'];
const payoutOptions: NonNullable<ResearcherProfile['defaultPayoutMethod']>[] = ['Bank transfer', 'Gift cards', 'Institution-managed', 'Other'];
const notificationOptions: NonNullable<ResearcherProfile['notifications']>[] = ['Email and push', 'Email only', 'Push only', 'Off'];

type DraftAvatar = { uri: string; scale: number; offsetX: number; offsetY: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTouchDistance(touches: Array<{ pageX: number; pageY: number }>) {
  if (touches.length < 2) return 0;
  return Math.hypot(touches[1].pageX - touches[0].pageX, touches[1].pageY - touches[0].pageY);
}

function avatarTransform(avatar: Pick<DraftAvatar, 'scale' | 'offsetX' | 'offsetY'>, renderedSize: number) {
  const ratio = renderedSize / AVATAR_SIZE;
  return [{ translateX: avatar.offsetX * ratio }, { translateY: avatar.offsetY * ratio }, { scale: avatar.scale }];
}

export default function ResearcherProfileScreen() {
  const { researcherProfile, setResearcherProfile, setRole, isParticipantSetupComplete } = useRole();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(researcherProfile);
  const [draftAvatar, setDraftAvatar] = useState<DraftAvatar | null>(null);
  const gestureStart = useRef({ x: 0, y: 0, scale: 1, distance: 0, centerX: 0, centerY: 0 });
  const activeTouchCount = useRef(0);

  const displayName = `${researcherProfile.firstName ?? ''} ${researcherProfile.lastName ?? ''}`.trim() || 'Researcher';

  const captureAvatarGestureStart = (touches: Array<{ pageX: number; pageY: number }>, current = draftAvatar) => {
    if (!current || touches.length === 0) return;
    const centerX = touches.length >= 2 ? (touches[0].pageX + touches[1].pageX) / 2 : touches[0].pageX;
    const centerY = touches.length >= 2 ? (touches[0].pageY + touches[1].pageY) / 2 : touches[0].pageY;
    activeTouchCount.current = touches.length;
    gestureStart.current = { x: current.offsetX, y: current.offsetY, scale: current.scale, distance: getTouchDistance(touches), centerX, centerY };
  };

  const avatarPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => Boolean(draftAvatar),
    onMoveShouldSetPanResponder: () => Boolean(draftAvatar),
    onStartShouldSetPanResponderCapture: () => Boolean(draftAvatar),
    onMoveShouldSetPanResponderCapture: () => Boolean(draftAvatar),
    onPanResponderGrant: (event) => captureAvatarGestureStart(event.nativeEvent.touches),
    onPanResponderMove: (event) => {
      const touches = event.nativeEvent.touches;
      if (touches.length === 0) return;
      setDraftAvatar((current) => {
        if (!current) return current;
        if (activeTouchCount.current !== touches.length) {
          captureAvatarGestureStart(touches, current);
          return current;
        }
        const centerX = touches.length >= 2 ? (touches[0].pageX + touches[1].pageX) / 2 : touches[0].pageX;
        const centerY = touches.length >= 2 ? (touches[0].pageY + touches[1].pageY) / 2 : touches[0].pageY;
        const next = { ...current, offsetX: gestureStart.current.x + centerX - gestureStart.current.centerX, offsetY: gestureStart.current.y + centerY - gestureStart.current.centerY };
        if (touches.length >= 2 && gestureStart.current.distance) {
          next.scale = clamp(gestureStart.current.scale * (getTouchDistance(touches) / gestureStart.current.distance), 1, 3.5);
        }
        return next;
      });
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: () => { activeTouchCount.current = 0; },
    onPanResponderTerminate: () => { activeTouchCount.current = 0; }
  });

  const openGallery = async () => {
    const ImagePicker = require('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.9 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setDraftAvatar({ uri: result.assets[0].uri, scale: researcherProfile.avatarScale ?? 1, offsetX: researcherProfile.avatarOffsetX ?? 0, offsetY: researcherProfile.avatarOffsetY ?? 0 });
    }
  };

  const saveAvatar = () => {
    if (!draftAvatar) return;
    setResearcherProfile((current) => ({ ...current, avatarUri: draftAvatar.uri, avatarScale: draftAvatar.scale, avatarOffsetX: draftAvatar.offsetX, avatarOffsetY: draftAvatar.offsetY }));
    setDraftAvatar(null);
  };

  const saveProfile = () => {
    setResearcherProfile(draft);
    setEditing(false);
  };

  const toggleDraftFocusArea = (area: string) => {
    setDraft((current) => ({ ...current, focusAreas: current.focusAreas?.includes(area) ? current.focusAreas.filter((entry) => entry !== area) : [...(current.focusAreas ?? []), area] }));
  };

  const switchToParticipant = () => {
    setRole('participant');
    router.replace(isParticipantSetupComplete ? '/(participant)' : '/(auth)/setup');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionHeader title="Researcher Profile" subtitle="Keep your workspace preferences up to date" />
      <Card>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarFrame}>
            {researcherProfile.avatarUri ? <Image source={{ uri: researcherProfile.avatarUri }} style={[styles.avatarImage, { transform: avatarTransform({ offsetX: researcherProfile.avatarOffsetX ?? 0, offsetY: researcherProfile.avatarOffsetY ?? 0, scale: researcherProfile.avatarScale ?? 1 }, 88) }]} /> : <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>}
          </View>
          <Button title="Upload profile picture" variant="secondary" onPress={openGallery} />
          <Text style={styles.photoHint}>Pick an image, then zoom and move it inside the circle.</Text>
        </View>
        <Text style={styles.value}>{displayName}</Text>
        <Text style={styles.text}>Research institution: {researcherProfile.institution || 'Not set'}</Text>
        <Text style={styles.text}>Focus areas: {researcherProfile.focusAreas?.join(', ') || 'Not set'}</Text>
        <Text style={styles.text}>Default payout method: {researcherProfile.defaultPayoutMethod || 'Not set'}</Text>
        <Text style={styles.text}>Notifications: {researcherProfile.notifications || 'Not set'}</Text>
      </Card>
      <Button title="Edit profile" onPress={() => { setDraft(researcherProfile); setEditing(true); }} />
      <Button title="Switch to participant view" variant="secondary" onPress={switchToParticipant} />

      <Modal visible={editing} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit researcher profile</Text>
            <TextInput value={draft.firstName ?? ''} onChangeText={(firstName) => setDraft((current) => ({ ...current, firstName }))} placeholder="First name" style={styles.input} />
            <TextInput value={draft.lastName ?? ''} onChangeText={(lastName) => setDraft((current) => ({ ...current, lastName }))} placeholder="Second name" style={styles.input} />
            <TextInput value={draft.institution ?? ''} onChangeText={(institution) => setDraft((current) => ({ ...current, institution }))} placeholder="Institution" style={styles.input} />
            <Text style={styles.label}>Focus areas</Text>
            <View style={styles.chips}>{focusAreaOptions.map((area) => <FilterChip key={area} label={area} active={Boolean(draft.focusAreas?.includes(area))} onPress={() => toggleDraftFocusArea(area)} />)}</View>
            <Text style={styles.label}>Default payout method</Text>
            <View style={styles.chips}>{payoutOptions.map((option) => <FilterChip key={option} label={option} active={draft.defaultPayoutMethod === option} onPress={() => setDraft((current) => ({ ...current, defaultPayoutMethod: option }))} />)}</View>
            <Text style={styles.label}>Notifications</Text>
            <View style={styles.chips}>{notificationOptions.map((option) => <FilterChip key={option} label={option} active={draft.notifications === option} onPress={() => setDraft((current) => ({ ...current, notifications: option }))} />)}</View>
            <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setEditing(false)} /><Button title="Save" onPress={saveProfile} /></View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(draftAvatar)} transparent animationType="slide">
        <View style={styles.avatarModalBackdrop}>
          <View style={styles.avatarEditorCard}>
            <Text style={styles.modalTitle}>Position your profile picture</Text>
            <Text style={styles.text}>Drag with one finger. Pinch with two fingers to zoom inside the circle.</Text>
            <View style={styles.editorAvatarFrame} {...avatarPanResponder.panHandlers}>{draftAvatar ? <Image source={{ uri: draftAvatar.uri }} style={[styles.editorImage, { transform: avatarTransform(draftAvatar, AVATAR_SIZE) }]} /> : null}</View>
            <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setDraftAvatar(null)} /><Button title="Save photo" onPress={saveAvatar} /></View>
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
  avatarFrame: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', backgroundColor: '#EAF9F2', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 88, height: 88, backgroundColor: '#fff' },
  avatarText: { fontSize: theme.typography.h1, color: theme.colors.primaryDark, fontWeight: '700' },
  photoHint: { color: theme.colors.textSecondary, fontSize: theme.typography.caption, textAlign: 'center' },
  value: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: theme.typography.h3 },
  text: { color: theme.colors.textSecondary, lineHeight: 20 },
  label: { color: theme.colors.textSecondary, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, backgroundColor: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: theme.spacing.lg },
  modalCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.md },
  modalTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.h3, fontWeight: '800', textAlign: 'center' },
  avatarModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: theme.spacing.sm },
  avatarEditorCard: { backgroundColor: '#fff', borderRadius: theme.radius.lg, padding: theme.spacing.sm, gap: theme.spacing.md, alignItems: 'stretch' },
  editorAvatarFrame: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: 'hidden', alignSelf: 'center', backgroundColor: '#EAF9F2', borderWidth: 4, borderColor: '#D3F3E4' },
  editorImage: { width: AVATAR_SIZE, height: AVATAR_SIZE }
});
