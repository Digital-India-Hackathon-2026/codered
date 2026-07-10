import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, radius, typography } from '../../theme';

interface QuickActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  tint?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = memo(({
  icon, title, subtitle, onPress,
}) => (
  <Pressable style={s.card} onPress={onPress}>
    <View style={s.iconWrap}>
      <Icon name={icon} size={20} color={colors.textSecondary} />
    </View>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{subtitle}</Text>
  </Pressable>
));

const s = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.cardTitle, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.meta, color: colors.textTertiary, textAlign: 'center', marginTop: 2 },
});
