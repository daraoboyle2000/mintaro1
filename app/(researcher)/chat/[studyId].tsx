import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { useRole } from '@/context/RoleContext';
import { ChatMessage } from '@/types';
import { theme } from '@/theme';

type ChatListRow = { id: string; label: string; message: ChatMessage };

function returnToMyStudies() {
  router.replace('/(researcher)');
}

export default function StudyChatScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const navigation = useNavigation();
  const { messages, sendMessage, studies } = useRole();
  const [draft, setDraft] = useState('');
  const [keyboardScreenY, setKeyboardScreenY] = useState<number | null>(null);
  const [composerHeight, setComposerHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [rootLayout, setRootLayout] = useState({ height: 0, pageY: 0 });
  const rootRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const study = studies.find((entry) => entry.id === studyId);

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

  const researcherName = 'Participant chat';
  const isKeyboardVisible = keyboardScreenY !== null;
  const rootBottom = rootLayout.height > 0 ? rootLayout.pageY + rootLayout.height : windowHeight;
  const inputKeyboardLift = isKeyboardVisible ? Math.ceil(inputHeight * 0.6) + theme.spacing.xs : 0;
  const composerBottomOffset = keyboardScreenY === null ? 0 : Math.max(0, rootBottom - keyboardScreenY) + inputKeyboardLift;
  const composerBottomPadding = isKeyboardVisible ? theme.spacing.md : Math.max(insets.bottom, theme.spacing.md);
  const listBottomPadding = composerHeight + composerBottomOffset + theme.spacing.lg;

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        returnToMyStudies();
        return true;
      });

      return () => subscription.remove();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <Pressable onPress={returnToMyStudies} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back to My Studies">
          <View style={styles.backPill}><Text style={styles.backLink}>← {study?.title ?? 'Study chat'}</Text></View>
        </Pressable>
      )
    });
  }, [navigation, study?.title]);

  const measureRoot = useCallback(() => {
    requestAnimationFrame(() => {
      rootRef.current?.measureInWindow((_x, pageY, _width, height) => {
        setRootLayout({ height, pageY });
      });
    });
  }, []);

  useEffect(() => {
    measureRoot();
  }, [measureRoot, windowHeight]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      measureRoot();
      setKeyboardScreenY(event.endCoordinates.screenY);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardScreenY(null);
      measureRoot();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [measureRoot]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View ref={rootRef} onLayout={measureRoot} style={styles.container}>
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
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPadding }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          renderItem={({ item }) => (
            <View>
              {item.label ? (
                <View style={styles.dayDivider}>
                  <View style={styles.line} />
                  <Text style={styles.dayLabel}>{item.label}</Text>
                  <View style={styles.line} />
                </View>
              ) : null}
              <View style={[styles.bubbleRow, item.message.from === 'researcher' ? styles.right : styles.left]}>
                <View style={[styles.bubble, item.message.from === 'researcher' ? styles.myBubble : styles.theirBubble]}>
                  <Text style={item.message.from === 'researcher' ? styles.myText : styles.theirText}>{item.message.message}</Text>
                </View>
              </View>
            </View>
          )}
        />

        <View
          onLayout={(event) => setComposerHeight(event.nativeEvent.layout.height)}
          style={[styles.composer, { bottom: composerBottomOffset, paddingBottom: composerBottomPadding }]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            style={styles.input}
            onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)}
            multiline
            maxLength={400}
          />
          <Pressable
            style={styles.sendButton}
            onPress={() => {
              sendMessage(studyId, draft, 'researcher');
              setDraft('');
            }}
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  backLink: { color: theme.colors.primaryDark, fontWeight: '800', fontSize: theme.typography.body },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studyTitle: { fontSize: theme.typography.h3, fontWeight: '700', color: theme.colors.textPrimary },
  researcherRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  researcherName: { color: theme.colors.textSecondary, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { padding: theme.spacing.lg, gap: theme.spacing.md },
  dayDivider: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
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
    position: 'absolute',
    left: 0,
    right: 0,
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
