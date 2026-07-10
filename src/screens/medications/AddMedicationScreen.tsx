import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Input } from '../../components/UI';
import { medicationsAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius } from '../../theme';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Medication</Text>

      <Input label="Medication Name" placeholder="e.g. Metformin" value={name} onChangeText={setName} />
      <Input label="Dosage" placeholder="e.g. 500mg" value={dosage} onChangeText={setDosage} />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.chipRow}>
        {FREQUENCIES.map(f => (
          <TouchableOpacity key={f} style={[styles.chip, frequency === f && styles.chipActive]} onPress={() => setFrequency(f)}>
            <Text style={[styles.chipText, frequency === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Timing</Text>
      <View style={styles.chipRow}>
        {TIMINGS.map(t => (
          <TouchableOpacity key={t} style={[styles.chip, timing === t && styles.chipActive]} onPress={() => setTiming(t)}>
            <Text style={[styles.chipText, timing === t && { color: '#fff' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.toggleRow} onPress={() => setWithFood(!withFood)}>
        <Text style={styles.toggleLabel}>🍽 Take with food</Text>
        <View style={[styles.toggle, withFood && styles.toggleActive]}>
          <View style={[styles.toggleDot, withFood && styles.toggleDotActive]} />
        </View>
      </TouchableOpacity>

      <Input label="Notes (optional)" placeholder="Any special instructions" value={notes} onChangeText={setNotes} multiline />

      <Button title="Save Medication" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, paddingBottom: 100 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xxl },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleLabel: { ...typography.body, color: colors.text },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.border, justifyContent: 'center', padding: 3 },
  toggleActive: { backgroundColor: colors.primary },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleDotActive: { alignSelf: 'flex-end' },
});
