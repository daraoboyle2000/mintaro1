import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { ChatMessage } from '@/types';
import { theme } from '@/theme';

export default function StudyChatScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const { messages, sendMessage } = useRole();
  const [draft, setDraft] = useState('');
  const study = mockStudies.find((entry) => entry.id === studyId);

  const thread = useMemo(() => messages.filter((entry) => entry.studyId === studyId), [messages, studyId]);
  const grouped = useMemo(() => {
    const result: Array<{ label: string; message: ChatMessage }> = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    thread.forEach((message, index) => {
      const created = new Date(message.sentAt.replace(' ', 'T'));
      const day = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      let label = day.toLocaleDateString();
      if (day.getTime() === today.getTime()) label = 'Today';
      if (day.getTime() === yesterday.getTime()) label = 'Yesterday';
      const previousLabel = index > 0 ? result[result.length - 1].label : null;
      if (previousLabel !== label) {
        result.push({ label, message });
      } else {
        result.push({ label: '', message });
      }
    });
    return result;
  }, [thread]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.studyTitle}>{study ? study.title : 'Study chat'}</Text>
          <View style={styles.researcherRow}>
            <View style={styles.researcherAvatar}>
              <Image source={require('../../../assets/icons/tab-profile-researcher.png')} style={styles.researcherIcon} />
            </View>
            <Text style={styles.researcherName}>{study?.researcherFirstName ?? 'Researcher'}</Text>
          </View>
        </View>
        {grouped.map(({ label, message }) => (
          <View key={message.id}>
            {label ? (
              <View style={styles.dayDivider}>
                <View style={styles.line} />
                <Text style={styles.dayLabel}>{label}</Text>
                <View style={styles.line} />
              </View>
            ) : null}
            <View style={[styles.bubbleRow, message.from === 'participant' ? styles.right : styles.left]}>
              <View style={[styles.bubble, message.from === 'participant' ? styles.myBubble : styles.theirBubble]}>
                <Text style={message.from === 'participant' ? styles.myText : styles.theirText}>{message.message}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          style={styles.input}
        />
        <Pressable
          style={styles.sendButton}
          onPress={() => {
            sendMessage(studyId, draft);
            setDraft('');
          }}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  header: { gap: theme.spacing.sm },
  studyTitle: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  researcherRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  researcherAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  researcherIcon: { width: 20, height: 20, tintColor: theme.colors.textSecondary },
  researcherName: { color: theme.colors.textSecondary, fontWeight: '600' },
  dayDivider: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dayLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.caption },
  bubbleRow: { flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  theirBubble: { backgroundColor: '#fff' },
  myBubble: { backgroundColor: theme.colors.primary },
  theirText: { color: theme.colors.primaryDark },
  myText: { color: '#fff' },
  composer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#fff'
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center'
  },
  sendText: { color: '#fff', fontWeight: '700' }
});
