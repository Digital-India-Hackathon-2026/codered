import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, typography, radius } from '../../theme';

interface ChatHeaderProps {
  onBack?: () => void;
  onMenu?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = memo(({ onBack, onMenu }) => (
  <View style={s.container}>
    {onBack && (
      <Pressable onPress={onBack} hitSlop={12} style={s.btn}>
        <Icon name="arrow-left" size={20} color={colors.text} />
      </Pressable>
    )}
    <View style={s.center}>
      <View style={s.avatar}>
        <Icon name="cpu" size={14} color={colors.primary} />
      </View>
      <View>
        <Text style={s.name}>Clary</Text>
        <Text style={s.status}>Online</Text>
      </View>
    </View>
    {onMenu && (
      <Pressable onPress={onMenu} hitSlop={12} style={s.btn}>
        <Icon name="clock" size={18} color={colors.textSecondary} />
      </Pressable>
    )}
  </View>
));

const s = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  btn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginLeft: spacing.sm },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center',
  },
  name: { ...typography.cardTitle, color: colors.text, fontWeight: '600' },
  status: { ...typography.meta, color: colors.success },
});
