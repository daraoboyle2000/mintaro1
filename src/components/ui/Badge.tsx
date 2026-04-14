import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF9F2',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6
  },
  text: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.caption,
    fontWeight: '600'
  }
});
