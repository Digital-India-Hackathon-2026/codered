import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

interface Answer {
  id: number;
  author: { username: string; image_src: string; account_type?: string };
  content: string;
}

export const AmaDetailScreen = ({ route, navigation }: any) => {
  const { question } = route.params;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    api.get(`/public/ama/${question.id}/answers`).then(res => {
      setAnswers(res.data?.answers || []);
    }).catch(() => {});
  }, [question.id]);

  const handleSubmit = async () => {
    if (!newAnswer.trim()) return;
    try {
      await api.post(`/ama/${question.id}/answers`, { content: newAnswer.trim() });
      setAnswers(prev => [...prev, { id: Date.now(), author: { username: 'You', image_src: '' }, content: newAnswer.trim() }]);
      setNewAnswer('');
    } catch {}
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="ArrowLeft" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Ask a Doctor</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.questionCard}>
            <Text style={s.title}>{question.title}</Text>
            <Text style={s.desc}>{question.description}</Text>
            {question.looking_for && question.looking_for.length > 0 && (
              <View style={s.tagsRow}>
                {question.looking_for.map((tag: string) => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={s.sectionTitle}>Answers ({answers.length})</Text>
          {answers.length === 0 ? (
            <Text style={s.emptyText}>No answers yet.</Text>
          ) : (
            answers.map(a => (
              <View key={a.id} style={s.answerCard}>
                <View style={s.answerHeader}>
                  <Image source={{ uri: a.author.image_src }} style={s.avatar} />
                  <View>
                    <Text style={s.answerAuthor}>{a.author.username}</Text>
                    {a.author.account_type === 'doctor' && (
                      <Text style={s.doctorBadge}>Verified Doctor</Text>
                    )}
                  </View>
                </View>
                <Text style={s.answerContent}>{a.content}</Text>
              </View>
            ))
          )}
          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Write an answer..."
            placeholderTextColor={colors.textTertiary}
            value={newAnswer}
            onChangeText={setNewAnswer}
            multiline
          />
          <Pressable onPress={handleSubmit} style={[s.sendBtn, !newAnswer.trim() && { opacity: 0.4 }]}>
            <Icon name="PaperPlaneTilt" size={18} color={colors.textInverse} weight="fill" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  title: { fontFamily: fonts.generalSans.semiBold, fontSize: 17, color: colors.text, marginBottom: 8 },
  desc: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontFamily: fonts.generalSans.medium, fontSize: 11, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 },
  emptyText: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary },
  answerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceSunken },
  answerAuthor: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text },
  doctorBadge: { fontFamily: fonts.generalSans.medium, fontSize: 10, color: colors.sage },
  answerContent: { fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: 10 },
  input: { flex: 1, fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.text, backgroundColor: colors.surfaceSunken, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 80 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.coral, justifyContent: 'center', alignItems: 'center' },
});
