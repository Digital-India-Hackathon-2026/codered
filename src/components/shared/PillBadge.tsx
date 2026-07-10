import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors, radius, spacing, typography } from '../../theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface PillBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successMuted, text: colors.success },
  warning: { bg: colors.warningMuted, text: colors.warning },
  danger: { bg: colors.dangerMuted, text: colors.danger },
  info: { bg: colors.primaryMuted, text: colors.primary },
  neutral: { bg: colors.surfaceSecondary, text: colors.textSecondary },
};

export const PillBadge: React.FC<PillBadgeProps> = memo(({ label, variant = 'neutral', icon }) => {
  const v = variantStyles[variant];
  return (
    <View style={[styles.container, { backgroundColor: v.bg }]}>
      {icon && <Icon name={icon} size={11} color={v.text} />}
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
});
