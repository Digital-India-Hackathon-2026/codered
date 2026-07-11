import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['critical', 'urgent', 'normal'];

export const CreateBloodRequestScreen = ({ navigation }: any) => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('urgent');
  const [units, setUnits] = useState('1');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!bloodGroup) return Alert.alert('Required', 'Please select a blood group.');
    if (!city.trim()) return Alert.alert('Required', 'Please enter the city.');
    setSubmitting(true);
    try {
      // Store locally for demo
      const existing = await AsyncStorage.getItem('blood_requests');
      const requests = existing ? JSON.parse(existing) : [];
      requests.unshift({
        id: Date.now(),
        blood_group: bloodGroup,
        urgency,
        units: parseInt(units) || 1,
        hospital: hospital.trim(),
        city: city.trim(),
        contact_number: contactNumber.trim(),
        patient_name: patientName.trim(),
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      });
      await AsyncStorage.setItem('blood_requests', JSON.stringify(requests));
      Alert.alert('Success', 'Blood request posted! Donors in your area will be notified.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not create request. Try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="X" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Request Blood</Text>
        <Pressable onPress={handleSubmit} disabled={submitting || !bloodGroup} style={[s.postBtn, (!bloodGroup || submitting) && { opacity: 0.4 }]}>
          <Text style={s.postBtnText}>{submitting ? 'Posting...' : 'Post'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Blood Group Selection */}
        <Text style={s.label}>Blood Group Needed *</Text>
        <View style={s.groupGrid}>
          {BLOOD_GROUPS.map(bg => (
            <Pressable key={bg} onPress={() => setBloodGroup(bg)} style={[s.groupChip, bloodGroup === bg && s.groupChipActive]}>
              <Text style={[s.groupChipText, bloodGroup === bg && s.groupChipTextActive]}>{bg}</Text>
            </Pressable>
          ))}
        </View>

        {/* Urgency */}
        <Text style={s.label}>Urgency Level</Text>
        <View style={s.chipsRow}>
          {URGENCY_LEVELS.map(u => (
            <Pressable key={u} onPress={() => setUrgency(u)} style={[s.chip, urgency === u && s.chipActive]}>
              <Text style={[s.chipText, urgency === u && s.chipTextActive]}>{u}</Text>
            </Pressable>
          ))}
        </View>

        {/* Units */}
        <Text style={s.label}>Units Required</Text>
        <TextInput style={s.input} value={units} onChangeText={setUnits} keyboardType="numeric" placeholder="1" placeholderTextColor={colors.textTertiary} />

        {/* Hospital */}
        <Text style={s.label}>Hospital Name</Text>
        <TextInput style={s.input} value={hospital} onChangeText={setHospital} placeholder="e.g. Apollo Hospital" placeholderTextColor={colors.textTertiary} />

        {/* City */}
        <Text style={s.label}>City *</Text>
        <TextInput style={s.input} value={city} onChangeText={setCity} placeholder="e.g. Mumbai" placeholderTextColor={colors.textTertiary} />

        {/* Contact */}
        <Text style={s.label}>Contact Number</Text>
        <TextInput style={s.input} value={contactNumber} onChangeText={setContactNumber} placeholder="Phone number" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />

        {/* Patient Name */}
        <Text style={s.label}>Patient Name (optional)</Text>
        <TextInput style={s.input} value={patientName} onChangeText={setPatientName} placeholder="Patient name" placeholderTextColor={colors.textTertiary} />

        {/* Notes */}
        <Text style={s.label}>Additional Notes</Text>
        <TextInput style={[s.input, s.textArea]} value={notes} onChangeText={setNotes} placeholder="Any additional info..." placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />

        <View style={{ height: 40 }} />
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
  content: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text, marginBottom: 8, marginTop: 16 },
  input: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { minHeight: 80, maxHeight: 150 },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupChip: { width: 56, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  groupChipActive: { backgroundColor: colors.coral, borderColor: colors.coral },
  groupChipText: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  groupChipTextActive: { color: colors.textInverse },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: { backgroundColor: colors.surfaceSunken, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.text },
  chipText: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: colors.textInverse },
});
