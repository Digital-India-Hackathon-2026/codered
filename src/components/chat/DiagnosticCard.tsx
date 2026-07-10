import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated } from 'react-native';

// ─── Permission Card ───
interface PermissionCardProps {
  title: string;
  content: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({ title, content, onAccept, onDecline }) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.permCard, { opacity, transform: [{ scale }] }]}>  
      <Text style={s.permIcon}>🩺</Text>
      <Text style={s.permTitle}>Assessment Available</Text>
      <Text style={s.permDesc}>{content}</Text>
      <Text style={s.permTime}>Usually takes less than 1 minute</Text>
      <View style={s.permBenefits}>
        <Text style={s.permBenefit}>✓ Better understanding</Text>
        <Text style={s.permBenefit}>✓ Personalized recommendations</Text>
        <Text style={s.permBenefit}>✓ Accurate next steps</Text>
      </View>
      <Pressable style={s.permPrimaryBtn} onPress={onAccept}>
        <Text style={s.permPrimaryText}>Continue Assessment</Text>
      </Pressable>
      <Pressable style={s.permGhostBtn} onPress={onDecline}>
        <Text style={s.permGhostText}>Maybe later</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── MCQ Card ───
interface MCQCardProps {
  question: string;
  options: string[];
  multiSelect?: boolean;
  onSubmit: (answer: string) => void;
  questionNumber?: number;
}

export const MCQCard: React.FC<MCQCardProps> = ({ question, options, multiSelect, onSubmit, questionNumber }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(); }, []);

  const toggle = (opt: string) => {
    if (multiSelect) {
      setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
    } else {
      onSubmit(opt);
    }
  };

  return (
    <Animated.View style={[s.qCard, { opacity }]}>
      {questionNumber && (
        <View style={s.qBadge}>
          <Text style={s.qBadgeText}>Q{questionNumber}</Text>
        </View>
      )}
      <Text style={s.qText}>{question}</Text>
      {multiSelect && <Text style={s.multiHint}>Select all that apply</Text>}
      <View style={s.optionsWrap}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              style={[s.optionChip, active && s.optionChipActive]}
              onPress={() => toggle(opt)}
            >
              {multiSelect && (
                <View style={[s.checkbox, active && s.checkboxActive]}>
                  {active && <Text style={s.checkmark}>✓</Text>}
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
interface TextQuestionCardProps {
  question: string;
  placeholder?: string;
  onSubmit: (answer: string) => void;
  questionNumber?: number;
}

export const TextQuestionCard: React.FC<TextQuestionCardProps> = ({ question, placeholder, onSubmit, questionNumber }) => {
  const [text, setText] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(); }, []);

  return (
    <Animated.View style={[s.qCard, { opacity }]}>
      {questionNumber && (
        <View style={s.qBadge}>
          <Text style={s.qBadgeText}>Q{questionNumber}</Text>
        </View>
      )}
      <Text style={s.qText}>{question}</Text>
      <TextInput
        style={s.textInput}
        value={text}
        onChangeText={setText}
        placeholder={placeholder || 'Type your answer...'}
        placeholderTextColor="#9CA3AF"
        multiline
      />
      <Pressable
        style={[s.continueBtn, !text.trim() && { opacity: 0.4 }]}
        onPress={() => text.trim() && onSubmit(text.trim())}
        disabled={!text.trim()}
      >
        <Text style={s.continueBtnText}>Submit</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Summary ───
interface SummaryCardProps {
  severity?: { code: string; score: number; reason: string };
  hypothesis?: string;
  narrative?: string;
  sections?: any;
  sectionOrder?: string[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ severity, hypothesis, narrative, sections, sectionOrder }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);

  const clean = (t: string) => t?.replace(/\$\*\//g, '').replace(/\/\*\$/g, '') || '';
  const sevColor = severity?.code === 'high' ? '#DC2626' : severity?.code === 'medium' ? '#F59E0B' : '#16A34A';
  const sevBg = severity?.code === 'high' ? '#FEF2F2' : severity?.code === 'medium' ? '#FFFBEB' : '#F0FDF4';

  return (
    <Animated.View style={[s.summaryWrap, { opacity }]}>
      {/* Severity */}
      {severity && (
        <View style={[s.sevCard, { backgroundColor: sevBg, borderColor: sevColor + '30' }]}>
          <View style={s.sevHeader}>
            <View style={[s.sevDot, { backgroundColor: sevColor }]} />
            <Text style={[s.sevLabel, { color: sevColor }]}>
              {severity.code === 'high' ? 'High' : severity.code === 'medium' ? 'Moderate' : 'Low'} Risk
            </Text>
            <Text style={s.sevScore}>{severity.score}/10</Text>
          </View>
          <Text style={s.sevReason}>{severity.reason}</Text>
        </View>
      )}

      {/* Hypothesis */}
      {hypothesis && (
        <View style={s.hypoCard}>
          <Text style={s.hypoLabel}>Most Likely</Text>
          <Text style={s.hypoText}>🦠 {hypothesis}</Text>
        </View>
      )}

      {/* Narrative */}
      {narrative && <Text style={s.narrative}>{clean(narrative)}</Text>}

      {/* Sections */}
      {sectionOrder?.map(key => {
        const sec = sections?.[key];
        if (!sec) return null;

        if (key === 'doctor_referral') return (
          <View key={key} style={s.secCard}>
            <Text style={s.secEmoji}>👨‍⚕️</Text>
            <Text style={s.secTitle}>{sec.specialization}</Text>
            <View style={s.urgencyBadge}>
              <Text style={s.urgencyText}>📅 {sec.timeframe}</Text>
            </View>
            <Text style={s.secBody}>{clean(sec.reason)}</Text>
            {sec.what_to_tell_doctor && (
              <View style={s.tellDoc}>
                <Text style={s.tellDocLabel}>Tell your doctor:</Text>
                {sec.what_to_tell_doctor.map((t: string, i: number) => (
                  <Text key={i} style={s.tellDocItem}>• {t}</Text>
                ))}
              </View>
            )}
          </View>
        );

        if (key === 'what_to_do_right_now') return (
          <View key={key} style={[s.secCard, { borderLeftWidth: 3, borderLeftColor: '#2D7FF9' }]}>
            <Text style={s.secEmoji}>⚡</Text>
            <Text style={s.secTitle}>{sec.title}</Text>
            {sec.steps?.map((step: string, i: number) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.stepText}>{clean(step.replace(/^Step \d+:\s*/, ''))}</Text>
              </View>
            ))}
            {sec.expected_recovery && (
              <View style={s.recoveryBox}>
                <Text style={s.recoveryText}>⏱ {sec.expected_recovery}</Text>
              </View>
            )}
          </View>
        );

        if (key === 'otc_medicines') return (
          <View key={key} style={s.secCard}>
            <Text style={s.secEmoji}>💊</Text>
            <Text style={s.secTitle}>OTC Medicines</Text>
            {sec.items?.map((med: any, i: number) => (
              <View key={i} style={s.medCard}>
                <Text style={s.medName}>{med.name}</Text>
                <Text style={s.medUse}>{med.use}</Text>
                <Text style={s.medWhen}>🕐 {med.when_to_take}</Text>
                {med.caution && <Text style={s.medCaution}>⚠️ {med.caution}</Text>}
              </View>
            ))}
            {sec.disclaimer && <Text style={s.disclaimer}>{sec.disclaimer}</Text>}
          </View>
        );

        if (key === 'what_to_do_long_term') return (
          <View key={key} style={s.secCard}>
            <Text style={s.secEmoji}>🎯</Text>
            <Text style={s.secTitle}>Healthy Habits</Text>
            {sec.habits?.map((h: string, i: number) => (
              <Text key={i} style={s.habitItem}>✔ {clean(h.split(':')[0])}</Text>
            ))}
          </View>
        );

        if (key === 'action_plan') return (
          <View key={key} style={s.secCard}>
            <Text style={s.secEmoji}>📋</Text>
            <Text style={s.secTitle}>{sec.title}</Text>
            {sec.items?.slice(0, 5).map((item: any, i: number) => (
              <View key={i} style={s.apItem}>
                <View style={[s.apDot, { backgroundColor: item.priority === 'high' ? '#DC2626' : '#F59E0B' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.apTitle}>{item.title}</Text>
                  <Text style={s.apDetail}>{clean(item.detail)}</Text>
                </View>
              </View>
            ))}
          </View>
        );

        return null;
      })}

      {/* Disclaimer */}
      <View style={s.disclaimerCard}>
        <Text style={s.disclaimerIcon}>ℹ️</Text>
        <Text style={s.disclaimerText}>This is not a confirmed diagnosis. Always consult a licensed physician.</Text>
      </View>
    </Animated.View>
  );
};

// ─── Styles ───
const s = StyleSheet.create({
  // Permission
  permCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFF', borderRadius: 24, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  permIcon: { fontSize: 28, marginBottom: 8 },
  permTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  permDesc: { fontSize: 15, lineHeight: 22, color: '#374151', marginBottom: 10 },
  permTime: { fontSize: 13, color: '#6B7280', marginBottom: 14 },
  permBenefits: { marginBottom: 18, gap: 6 },
  permBenefit: { fontSize: 14, color: '#16A34A', fontWeight: '500' },
  permPrimaryBtn: { backgroundColor: '#2D7FF9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  permPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  permGhostBtn: { alignItems: 'center', paddingVertical: 8 },
  permGhostText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },

  // Question Card
  qCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  qBadge: { backgroundColor: '#EAF4FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  qBadgeText: { fontSize: 12, fontWeight: '700', color: '#2D7FF9' },
  qText: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 24, marginBottom: 16 },
  multiHint: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  optionsWrap: { gap: 10 },
  optionChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FAFBFC' },
  optionChipActive: { borderColor: '#2D7FF9', backgroundColor: '#EAF4FF' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#2D7FF9', borderColor: '#2D7FF9' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  optionLabel: { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1 },
  optionLabelActive: { color: '#2D7FF9', fontWeight: '600' },
  continueBtn: { backgroundColor: '#2D7FF9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  continueBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  // Text Input
  textInput: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, fontSize: 15, color: '#111827', minHeight: 70, textAlignVertical: 'top', backgroundColor: '#FAFBFC', marginBottom: 4 },

  // Summary
  summaryWrap: { marginHorizontal: 16, marginBottom: 12, gap: 12 },
  sevCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  sevHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  sevLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  sevScore: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sevReason: { fontSize: 13, color: '#374151', lineHeight: 18 },
  hypoCard: { backgroundColor: '#EAF4FF', borderRadius: 16, padding: 14 },
  hypoLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  hypoText: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 4 },
  narrative: { fontSize: 14.5, lineHeight: 22, color: '#374151', paddingHorizontal: 4 },
  secCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  secEmoji: { fontSize: 22, marginBottom: 6 },
  secTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  secBody: { fontSize: 14, lineHeight: 20, color: '#374151' },
  urgencyBadge: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 10 },
  urgencyText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },
  tellDoc: { marginTop: 12, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  tellDocLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  tellDocItem: { fontSize: 13, color: '#374151', lineHeight: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EAF4FF', justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#2D7FF9' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20, color: '#374151' },
  recoveryBox: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, marginTop: 8 },
  recoveryText: { fontSize: 13, color: '#16A34A', fontWeight: '500' },
  medCard: { backgroundColor: '#FAFBFC', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  medName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  medUse: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  medWhen: { fontSize: 12, color: '#374151', marginTop: 4 },
  medCaution: { fontSize: 12, color: '#F59E0B', marginTop: 4 },
  disclaimer: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  habitItem: { fontSize: 14, color: '#16A34A', fontWeight: '500', marginBottom: 6 },
  apItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  apDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  apTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  apDetail: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginTop: 2 },
  disclaimerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, gap: 8 },
  disclaimerIcon: { fontSize: 14 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 17 },
});
