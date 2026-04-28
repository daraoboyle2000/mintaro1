import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRole } from '@/context/RoleContext';
import { mockStudies } from '@/data/mockData';
import { theme } from '@/theme';

export default function StudyChatScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const { messages, sendMessage } = useRole();
  const [draft, setDraft] = useState('');
  const study = mockStudies.find((entry) => entry.id === studyId);

  const thread = useMemo(() => messages.filter((entry) => entry.studyId === studyId), [messages, studyId]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader title={study ? `${study.title} chat` : 'Study chat'} subtitle="Message the researcher" />
        {thread.map((message) => (
          <Card key={message.id}>
            <View style={styles.messageMeta}>
              <Text style={styles.from}>{message.from === 'participant' ? 'You' : 'Researcher'}</Text>
              <Text style={styles.time}>{message.sentAt}</Text>
            </View>
            <Text style={styles.message}>{message.message}</Text>
          </Card>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  messageMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  from: { fontWeight: '700', color: theme.colors.textPrimary },
  time: { color: theme.colors.textSecondary, fontSize: theme.typography.caption },
  message: { color: theme.colors.textPrimary },
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
