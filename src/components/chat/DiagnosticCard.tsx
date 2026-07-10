import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon, PillBadge } from '../shared';
import { colors, spacing, radius, shadows, typography } from '../../theme';

// ─── Permission Card ───
interface PermissionCardProps { title: string; content: string; onAccept: () => void; onDecline: () => void; }

export const PermissionCard: React.FC<PermissionCardProps> = ({ title, content, onAccept, onDecline }) => (
  <Animated.View entering={FadeIn.duration(150)} style={s.permCard}>
    <Icon name="clipboard" size={28} state="active" />
    <Text style={s.permTitle}>Assessment Available</Text>
    <Text style={s.permDesc}>{content}</Text>
    <Text style={s.permTime}>Usually takes less than 1 minute</Text>
    <View style={s.permBenefits}>
      <View style={s.benefitRow}><Icon name="check" size={14} state="success" /><Text style={s.permBenefit}>Better understanding</Text></View>
      <View style={s.benefitRow}><Icon name="check" size={14} state="success" /><Text style={s.permBenefit}>Personalized recommendations</Text></View>
      <View style={s.benefitRow}><Icon name="check" size={14} state="success" /><Text style={s.permBenefit}>Accurate next steps</Text></View>
    </View>
    <Pressable style={s.permPrimaryBtn} onPress={onAccept}>
      <Text style={s.permPrimaryText}>Continue Assessment</Text>
    </Pressable>
    <Pressable style={s.permGhostBtn} onPress={onDecline}>
      <Text style={s.permGhostText}>Maybe later</Text>
    </Pressable>
  </Animated.View>
);

// ─── MCQ Card ───
interface MCQCardProps { question: string; options: string[]; multiSelect?: boolean; onSubmit: (answer: string) => void; questionNumber?: number; }

export const MCQCard: React.FC<MCQCardProps> = ({ question, options, multiSelect, onSubmit, questionNumber }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (opt: string) => {
    if (multiSelect) { setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]); }
    else { onSubmit(opt); }
  };

  return (
    <Animated.View entering={FadeIn.duration(150)} style={s.qCard}>
      {questionNumber != null && <PillBadge label={`Question ${questionNumber}`} variant="info" icon="help-circle" />}
      <Text style={s.qText}>{question}</Text>
      {multiSelect && <Text style={s.multiHint}>Select all that apply</Text>}
      <View style={s.optionsWrap}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <Pressable key={opt} style={[s.optionChip, active ? s.optionChipActive : undefined]} onPress={() => toggle(opt)}>
              {multiSelect && (
                <View style={[s.checkbox, active && s.checkboxActive]}>
                  {active && <Icon name="check" size={12} color="#FFF" />}
                </View>
              )}
              <Text style={[s.optionLabel, active && s.optionLabelActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {multiSelect && selected.length > 0 && (
        <Pressable style={s.continueBtn} onPress={() => onSubmit(selected.join(', '))}>
          <Text style={s.continueBtnText}>Continue</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

// ─── Text Question ───
interface TextQuestionCardProps { question: string; placeholder?: string; onSubmit: (answer: string) => void; questionNumber?: number; }

export const TextQuestionCard: React.FC<TextQuestionCardProps> = ({ question, placeholder, onSubmit, questionNumber }) => {
  const [text, setText] = useState('');
  return (
    <Animated.View entering={FadeIn.duration(150)} style={s.qCard}>
      {questionNumber != null && <PillBadge label={`Question ${questionNumber}`} variant="info" icon="help-circle" />}
      <Text style={s.qText}>{question}</Text>
      <TextInput style={s.textInput} value={text} onChangeText={setText} placeholder={placeholder || 'Type your answer...'} placeholderTextColor={colors.textTertiary} multiline />
      <Pressable style={[s.continueBtn, !text.trim() ? { opacity: 0.4 } : undefined]} onPress={() => text.trim() && onSubmit(text.trim())} disabled={!text.trim()}>
        <Text style={s.continueBtnText}>Submit</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Summary Card ───
interface SummaryCardProps { severity?: { code: string; score: number; reason: string }; hypothesis?: string; narrative?: string; sections?: any; sectionOrder?: string[]; }

export const SummaryCard: React.FC<SummaryCardProps> = ({ severity, hypothesis, narrative, sections, sectionOrder }) => {
  const clean = (t: string) => t?.replace(/\$\*\//g, '').replace(/\/\*\$/g, '') || '';
  const sevVariant = severity?.code === 'high' ? 'danger' : severity?.code === 'medium' ? 'warning' : 'success';

  return (
    <Animated.View entering={FadeIn.duration(200)} style={s.summaryWrap}>
      {/* Severity */}
      {severity && (
        <View style={s.sevCard}>
          <View style={s.sevHeader}>
            <PillBadge label={`${severity.code === 'high' ? 'High' : severity.code === 'medium' ? 'Moderate' : 'Low'} Risk`} variant={sevVariant as any} icon="alert-triangle" />
            <Text style={s.sevScore}>{severity.score}/10</Text>
          </View>
          <Text style={s.sevReason}>{severity.reason}</Text>
        </View>
      )}

      {/* Hypothesis — highlighted panel */}
      {hypothesis && (
        <View style={s.hypoCard}>
          <Icon name="target" size={18} state="active" />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={s.hypoLabel}>Most Likely</Text>
            <Text style={s.hypoText}>{hypothesis}</Text>
          </View>
        </View>
      )}

      {/* Narrative */}
      {narrative && <Text style={s.narrative}>{clean(narrative)}</Text>}

      {/* Sections with icon-led subheadings */}
      {sectionOrder?.map(key => {
        const sec = sections?.[key];
        if (!sec) return null;

        if (key === 'doctor_referral') return (
          <View key={key} style={s.secCard}>
            <View style={s.secHeading}><Icon name="user-plus" size={18} state="active" /><Text style={s.secTitle}>{sec.specialization}</Text></View>
            <PillBadge label={sec.timeframe} variant="danger" icon="calendar" />
            <Text style={s.secBody}>{clean(sec.reason)}</Text>
            {sec.what_to_tell_doctor && (
              <View style={s.tellDoc}>
                <Text style={s.tellDocLabel}>Tell your doctor:</Text>
                {sec.what_to_tell_doctor.map((t: string, i: number) => <Text key={i} style={s.tellDocItem}>• {t}</Text>)}
              </View>
            )}
          </View>
        );

        if (key === 'what_to_do_right_now') return (
          <View key={key} style={[s.secCard, { borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
            <View style={s.secHeading}><Icon name="zap" size={18} state="active" /><Text style={s.secTitle}>{sec.title}</Text></View>
            {sec.steps?.map((step: string, i: number) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.stepText}>{clean(step.replace(/^Step \d+:\s*/, ''))}</Text>
              </View>
            ))}
            {sec.expected_recovery && <PillBadge label={sec.expected_recovery} variant="success" icon="clock" />}
          </View>
        );

        if (key === 'otc_medicines') return (
          <View key={key} style={s.secCard}>
            <View style={s.secHeading}><Icon name="package" size={18} state="active" /><Text style={s.secTitle}>OTC Medicines</Text></View>
            {sec.items?.map((med: any, i: number) => (
              <View key={i} style={s.medCard}>
                <Text style={s.medName}>{med.name}</Text>
                <Text style={s.medUse}>{med.use}</Text>
                {med.caution && <View style={{ marginTop: spacing.xs }}><PillBadge label={med.caution} variant="warning" icon="alert-circle" /></View>}
              </View>
            ))}
          </View>
        );

        if (key === 'what_to_do_long_term') return (
          <View key={key} style={s.secCard}>
            <View style={s.secHeading}><Icon name="target" size={18} state="active" /><Text style={s.secTitle}>Healthy Habits</Text></View>
            {sec.habits?.map((h: string, i: number) => (
              <View key={i} style={s.habitRow}><Icon name="check-circle" size={14} state="success" /><Text style={s.habitItem}>{clean(h.split(':')[0])}</Text></View>
            ))}
          </View>
        );

        if (key === 'action_plan') return (
          <View key={key} style={s.secCard}>
            <View style={s.secHeading}><Icon name="list" size={18} state="active" /><Text style={s.secTitle}>{sec.title}</Text></View>
            {sec.items?.slice(0, 5).map((item: any, i: number) => (
              <View key={i} style={s.apItem}>
                <PillBadge label={item.priority} variant={item.priority === 'high' ? 'danger' : 'warning'} />
                <Text style={s.apTitle}>{item.title}</Text>
                <Text style={s.apDetail}>{clean(item.detail)}</Text>
              </View>
            ))}
          </View>
        );

        return null;
      })}

      {/* Disclaimer — visually separated */}
      <View style={s.disclaimerCard}>
        <Icon name="info" size={14} color={colors.textTertiary} />
        <Text style={s.disclaimerText}>This is not a confirmed diagnosis. Always consult a licensed physician.</Text>
      </View>
    </Animated.View>
  );
};

// ─── Styles ───
const s = StyleSheet.create({
  // Permission
  permCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  permTitle: { ...typography.sectionTitle, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  permDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  permTime: { ...typography.meta, color: colors.textTertiary, marginBottom: spacing.lg },
  permBenefits: { marginBottom: spacing.xl, gap: spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  permBenefit: { ...typography.body, color: colors.success, fontWeight: '500' },
  permPrimaryBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', marginBottom: spacing.sm },
  permPrimaryText: { ...typography.cardTitle, color: '#FFF' },
  permGhostBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  permGhostText: { ...typography.body, color: colors.textSecondary },

  // Question Card
  qCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  qText: { ...typography.cardTitle, color: colors.text, lineHeight: 24, marginTop: spacing.md, marginBottom: spacing.lg },
  multiHint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  optionsWrap: { gap: spacing.sm },
  optionChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingVertical: 14, paddingHorizontal: spacing.lg, backgroundColor: colors.surface },
  optionChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: colors.border, marginRight: spacing.md, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  optionLabelActive: { color: colors.primary, fontWeight: '600' },
  continueBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg },
  continueBtnText: { ...typography.cardTitle, color: '#FFF' },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, ...typography.body, color: colors.text, minHeight: 70, textAlignVertical: 'top', backgroundColor: colors.surfaceElevated, marginBottom: spacing.xs },

  // Summary
  summaryWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.lg },
  sevCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  sevHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sevScore: { ...typography.screenTitle, color: colors.text },
  sevReason: { ...typography.body, color: colors.textSecondary },
  hypoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.primaryMuted, borderRadius: radius.xl, padding: spacing.lg },
  hypoLabel: { ...typography.meta, color: colors.textSecondary },
  hypoText: { ...typography.cardTitle, color: colors.text, marginTop: spacing.xs },
  narrative: { ...typography.body, color: colors.textSecondary, lineHeight: 22, paddingHorizontal: spacing.xs },
  secCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  secHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  secTitle: { ...typography.cardTitle, color: colors.text },
  secBody: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  tellDoc: { marginTop: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, padding: spacing.md },
  tellDocLabel: { ...typography.meta, color: colors.textSecondary, marginBottom: spacing.sm },
  tellDocItem: { ...typography.body, color: colors.text, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { ...typography.meta, color: colors.primary, fontWeight: '700' },
  stepText: { flex: 1, ...typography.body, color: colors.text },
  medCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  medName: { ...typography.cardTitle, color: colors.text },
  medUse: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  habitItem: { ...typography.body, color: colors.text },
  apItem: { marginBottom: spacing.md },
  apTitle: { ...typography.cardTitle, color: colors.text, marginTop: spacing.xs },
  apDetail: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  disclaimerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  disclaimerText: { flex: 1, ...typography.meta, color: colors.textTertiary, lineHeight: 17 },
});
