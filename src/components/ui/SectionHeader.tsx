import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs
  },
  title: {
    fontSize: theme.typography.h2,
    color: theme.colors.textPrimary,
    fontWeight: '700'
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body
  }
});
