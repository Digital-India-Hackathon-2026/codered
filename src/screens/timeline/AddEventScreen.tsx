import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Input } from '../../components/UI';
import { timelineAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius } from '../../theme';

const EVENT_TYPES = [
  { key: 'symptom', icon: '🤒', label: 'Symptom' },
  { key: 'consultation', icon: '👨⚕️', label: 'Consultation' },
  { key: 'vaccination', icon: '💉', label: 'Vaccination' },
  { key: 'surgery', icon: '🏥', label: 'Surgery' },
  { key: 'wellness', icon: '🧘', label: 'Wellness' },
  { key: 'medication_change', icon: '💊', label: 'Med Change' },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Event</Text>

      <Text style={styles.label}>Event Type</Text>
      <View style={styles.typeGrid}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[styles.typeCard, type === t.key && styles.typeCardActive]} onPress={() => setType(t.key)}>
            <Text style={{ fontSize: 24 }}>{t.icon}</Text>
            <Text style={[styles.typeLabel, type === t.key && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Title" placeholder="e.g. Visited cardiologist" value={title} onChangeText={setTitle} />
      <Input label="Date" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
      <Input label="Description (optional)" placeholder="Add details..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />

      <Button title="Save Event" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 100 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xxl },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  typeCard: {
    width: '30%', alignItems: 'center', padding: spacing.md,
    borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  typeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
});
