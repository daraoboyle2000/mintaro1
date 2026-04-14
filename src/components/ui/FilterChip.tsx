import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/theme';

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, active = false, onPress }: FilterChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.activeChip]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#fff'
  },
  activeChip: {
    backgroundColor: '#EAF9F2',
    borderColor: theme.colors.primary
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '500'
  },
  activeText: {
    color: theme.colors.primaryDark
  }
});
