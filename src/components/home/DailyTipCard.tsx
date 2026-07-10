import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, radius, typography } from '../../theme';

interface DailyTipCardProps {
  icon: string;
  title: string;
  body: string;
  onPress?: () => void;
}

export const DailyTipCard: React.FC<DailyTipCardProps> = memo(({
  icon, title, body, onPress,
}) => (
  <Pressable style={s.card} onPress={onPress}>
    <View style={s.iconRow}>
      <Icon name={icon} size={16} color={colors.textSecondary} />
      <Text style={s.title} numberOfLines={1}>{title}</Text>
    </View>
    <Text style={s.body} numberOfLines={3}>{body}</Text>
  </Pressable>
));

const s = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { ...typography.cardTitle, color: colors.text, flex: 1 },
  body: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
});
