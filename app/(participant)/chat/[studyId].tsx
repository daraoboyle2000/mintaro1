import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { ChatMessage } from '@/types';
import { theme } from '@/theme';

type ChatListRow = { id: string; label: string; message: ChatMessage };

export default function StudyChatScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const { messages, sendMessage } = useRole();
  const [draft, setDraft] = useState('');
  const insets = useSafeAreaInsets();
  const study = mockStudies.find((entry) => entry.id === studyId);

  const thread = useMemo(() => messages.filter((entry) => entry.studyId === studyId), [messages, studyId]);
  const grouped = useMemo<ChatListRow[]>(() => {
    const result: ChatListRow[] = [];
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
      result.push({ id: message.id, label: previousLabel !== label ? label : '', message });
    });
    return result;
  }, [thread]);

  const researcherName = study?.researcherFirstName ? `${study.researcherFirstName} Researcher` : 'Researcher';

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.studyTitle}>{study ? study.title : 'Study chat'}</Text>
          <View style={styles.researcherRow}>
            <Avatar name={researcherName} size={46} />
            <Text style={styles.researcherName}>{researcherName}</Text>
          </View>
        </View>

        <FlatList
          data={grouped}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View>
              {item.label ? (
                <View style={styles.dayDivider}>
                  <View style={styles.line} />
                  <Text style={styles.dayLabel}>{item.label}</Text>
                  <View style={styles.line} />
                </View>
              ) : null}
              <View style={[styles.bubbleRow, item.message.from === 'participant' ? styles.right : styles.left]}>
                <View style={[styles.bubble, item.message.from === 'participant' ? styles.myBubble : styles.theirBubble]}>
                  <Text style={item.message.from === 'participant' ? styles.myText : styles.theirText}>{item.message.message}</Text>
                </View>
              </View>
            </View>
          )}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }] }>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            style={styles.input}
            multiline
            maxLength={400}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  studyTitle: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  researcherRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  researcherName: { color: theme.colors.textSecondary, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#fff',
    maxHeight: 120
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center'
  },
  sendText: { color: '#fff', fontWeight: '700' }
});
