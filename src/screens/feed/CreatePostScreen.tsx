import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

const CATEGORIES = ['General', 'Mental Health', 'Nutrition', 'Fitness', 'Chronic Illness', 'Women\'s Health'];
const INTENTS = ['discussion', 'question', 'experience', 'advice'];

export const CreatePostScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [intent, setIntent] = useState('discussion');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Required', 'Please add a title.');
    setSubmitting(true);
    try {
      await api.post('/posts/create', { title: title.trim(), description: description.trim(), category: category || 'General', intent });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not create post. Try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="X" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Create Post</Text>
        <Pressable onPress={handleSubmit} disabled={submitting || !title.trim()} style={[s.postBtn, (!title.trim() || submitting) && { opacity: 0.4 }]}>
          <Text style={s.postBtnText}>{submitting ? 'Posting...' : 'Post'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.label}>Title</Text>
        <TextInput
          style={s.input}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="Share more details..."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text style={s.label}>Category</Text>
        <View style={s.chipsRow}>
          {CATEGORIES.map(c => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipActive]}>
              <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>Intent</Text>
        <View style={s.chipsRow}>
          {INTENTS.map(i => (
            <Pressable key={i} onPress={() => setIntent(i)} style={[s.chip, intent === i && s.chipActive]}>
              <Text style={[s.chipText, intent === i && s.chipTextActive]}>{i}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  postBtn: { backgroundColor: colors.coral, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 8 },
  postBtnText: { fontFamily: fonts.generalSans.semiBold, fontSize: 13, color: colors.textInverse },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text, marginBottom: 8, marginTop: 16 },
  input: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { minHeight: 100, maxHeight: 200 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.surfaceSunken, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: colors.textInverse },
});
