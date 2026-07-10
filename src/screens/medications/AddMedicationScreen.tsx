import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Button, Input } from '../../components/UI';
import { Icon } from '../../components/shared';
import { medicationsAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly'];
const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'Night', 'Before meals', 'After meals'];

export const AddMedicationScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timing, setTiming] = useState('Morning');
  const [withFood, setWithFood] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !dosage) { Alert.alert('Error', 'Name and dosage are required'); return; }
    setSaving(true);
    try {
      await medicationsAPI.add({ name, dosage, frequency, timing, with_food: withFood, notes });
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not save medication'); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Add Medication</Text>

      <Input label="Medication Name" placeholder="e.g. Metformin" value={name} onChangeText={setName} />
      <Input label="Dosage" placeholder="e.g. 500mg" value={dosage} onChangeText={setDosage} />

      <Text style={s.label}>Frequency</Text>
      <View style={s.chipRow}>
        {FREQUENCIES.map(f => (
          <Pressable key={f} style={[s.chip, frequency === f && s.chipActive]} onPress={() => setFrequency(f)}>
            <Text style={[s.chipText, frequency === f && { color: '#FFF' }]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.label}>Timing</Text>
      <View style={s.chipRow}>
        {TIMINGS.map(t => (
          <Pressable key={t} style={[s.chip, timing === t && s.chipActive]} onPress={() => setTiming(t)}>
            <Text style={[s.chipText, timing === t && { color: '#FFF' }]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.toggleRow} onPress={() => setWithFood(!withFood)}>
        <View style={s.toggleLeft}>
          <Icon name="coffee" size={16} color={colors.textSecondary} />
          <Text style={s.toggleLabel}>Take with food</Text>
        </View>
        <View style={[s.toggle, withFood && s.toggleActive]}>
          <View style={[s.toggleDot, withFood && s.toggleDotActive]} />
        </View>
      </Pressable>

      <Input label="Notes (optional)" placeholder="Any special instructions" value={notes} onChangeText={setNotes} multiline />

      <Button title="Save Medication" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 100 },
  title: { ...typography.screenTitle, color: colors.text, marginBottom: spacing.xl },
  label: { ...typography.meta, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.meta, color: colors.textSecondary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel: { ...typography.body, color: colors.text },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center', padding: 2 },
  toggleActive: { backgroundColor: colors.primary },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleDotActive: { alignSelf: 'flex-end' },
});
