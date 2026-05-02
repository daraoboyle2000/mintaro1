import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

type AvatarProps = {
  name?: string;
  imageUri?: string;
  size?: number;
  showBorder?: boolean;
};

function getInitials(name?: string) {
  if (!name) return 'R';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'R';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Avatar({ name, imageUri, size = 46, showBorder = true }: AvatarProps) {
  const initials = getInitials(name);
  const radius = size / 2;
  const borderStyle = showBorder ? styles.bordered : undefined;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.base, borderStyle, { width: size, height: size, borderRadius: radius }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        borderStyle,
        { width: size, height: size, borderRadius: radius }
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.max(14, Math.round(size * 0.34)) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  bordered: { borderWidth: 1, borderColor: theme.colors.border },
  fallback: { backgroundColor: '#EAF8F2' },
  initials: { color: theme.colors.primaryDark, fontWeight: '700' }
});
