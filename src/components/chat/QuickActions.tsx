import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import ClaryOrb from '../shared/ClaryOrb';
import { Icon } from '../shared/Icon';
import { colors, radius, fonts } from '../../theme';

interface QuickActionsProps {
  onSelect: (text: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

const SUGGESTIONS = [
  'I have a headache and light sensitivity',
  'Explain my last blood report',
  'What medications interact with ibuprofen?',
];

export const QuickActions: React.FC<QuickActionsProps> = memo(({ onSelect, language = 'en', onLanguageChange }) => (
  <View style={s.container}>
    <Animated.View entering={FadeIn.duration(300)} style={s.header}>
      <ClaryOrb size={72} glow />
      <Text style={s.title}>Hi, I'm Vita</Text>
      <Text style={s.subtitle}>
        Ask about a symptom, a medication, or{'\n'}a report — I'll take it from there.
      </Text>

      {/* Language Selector */}
      {onLanguageChange && (
        <Animated.View entering={FadeInDown.delay(100).duration(200)} style={s.langRow}>
          <Icon name="Translate" size={14} color={colors.textTertiary} weight="regular" />
          <Text style={s.langHint}>Reply in:</Text>
          <Pressable
            onPress={() => onLanguageChange('en')}
            style={[s.langPill, language === 'en' && s.langPillActive]}
          >
            <Text style={[s.langPillText, language === 'en' && s.langPillTextActive]}>English</Text>
          </Pressable>
          <Pressable
            onPress={() => onLanguageChange('te')}
            style={[s.langPill, language === 'te' && s.langPillActive]}
          >
            <Text style={[s.langPillText, language === 'te' && s.langPillTextActive]}>తెలుగు</Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>

    <View style={s.chips}>
      {SUGGESTIONS.map((text, i) => (
        <Animated.View key={text} entering={FadeInDown.delay(i * 80 + 150).duration(180).damping(18)}>
          <Pressable style={s.chip} onPress={() => onSelect(text)}>
            <Text style={s.chipText}>{text}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontFamily: fonts.fraunces.semiBold, fontSize: 24, color: colors.text, marginTop: 16 },
  subtitle: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langHint: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
  },
  langPillActive: {
    backgroundColor: colors.text,
  },
  langPillText: {
    fontFamily: fonts.generalSans.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: colors.textInverse,
  },
  chips: { gap: 10 },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chipText: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.text },
});
