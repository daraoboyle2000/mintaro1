import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/theme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, variant === 'secondary' ? styles.secondary : styles.primary]}
    >
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: theme.typography.body
  },
  secondaryText: {
    color: theme.colors.textPrimary
  }
});
