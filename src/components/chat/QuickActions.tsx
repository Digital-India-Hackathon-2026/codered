import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, radius, typography } from '../../theme';

interface QuickActionsProps {
  onSelect: (text: string) => void;
}

const ACTIONS = [
  { icon: 'thermometer', label: 'I have a fever', text: 'I have a fever' },
  { icon: 'cloud', label: 'Headache', text: 'I have a headache' },
  { icon: 'zap', label: 'Fatigue', text: 'I feel very tired and fatigued' },
  { icon: 'heart', label: 'Chest pain', text: 'I have chest pain' },
  { icon: 'frown', label: 'Anxiety', text: 'I feel anxious' },
];

export const QuickActions: React.FC<QuickActionsProps> = memo(({ onSelect }) => (
  <View style={s.container}>
    <View style={s.header}>
      <View style={s.avatar}>
        <Icon name="cpu" size={20} color={colors.primary} />
      </View>
      <Text style={s.title}>How can I help?</Text>
      <Text style={s.subtitle}>Describe your symptoms or pick a topic below.</Text>
    </View>
    <ScrollView contentContainerStyle={s.chips}>
      {ACTIONS.map(a => (
        <Pressable key={a.label} style={s.chip} onPress={() => onSelect(a.text)}>
          <Icon name={a.icon} size={14} color={colors.textSecondary} />
          <Text style={s.chipText}>{a.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
));

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing['2xl'] },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.sectionTitle, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  chipText: { ...typography.caption, color: colors.text },
});
