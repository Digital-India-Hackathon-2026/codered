import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Button, Input } from '../../components/UI';
import { Icon } from '../../components/shared';
import { timelineAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

const EVENT_TYPES = [
  { key: 'symptom', icon: 'thermometer', label: 'Symptom' },
  { key: 'consultation', icon: 'user', label: 'Consultation' },
  { key: 'vaccination', icon: 'shield', label: 'Vaccination' },
  { key: 'surgery', icon: 'scissors', label: 'Surgery' },
  { key: 'wellness', icon: 'heart', label: 'Wellness' },
  { key: 'medication_change', icon: 'package', label: 'Med Change' },
];

export const AddEventScreen = ({ navigation }: any) => {
  const [type, setType] = useState('symptom');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title) { Alert.alert('Error', 'Title is required'); return; }
    setSaving(true);
    try {
      await timelineAPI.addEvent({ type, title, description, date });
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not save event'); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Add Event</Text>

      <Text style={s.label}>Event Type</Text>
      <View style={s.typeGrid}>
        {EVENT_TYPES.map(t => (
          <Pressable key={t.key} style={[s.typeCard, type === t.key && s.typeCardActive]} onPress={() => setType(t.key)}>
            <Icon name={t.icon} size={20} color={type === t.key ? '#FFF' : colors.textSecondary} />
            <Text style={[s.typeLabel, type === t.key && { color: '#FFF' }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Title" placeholder="e.g. Visited cardiologist" value={title} onChangeText={setTitle} />
      <Input label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
      <Input label="Description (optional)" placeholder="Add details..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />

      <Button title="Save Event" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 100 },
  title: { ...typography.screenTitle, color: colors.text, marginBottom: spacing.xl },
  label: { ...typography.meta, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  typeCard: {
    width: '30%', alignItems: 'center', padding: spacing.md, gap: spacing.sm,
    borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  typeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { ...typography.meta, color: colors.textSecondary },
});
