import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { Button, Input } from '../../components/UI';
import { Icon } from '../../components/shared';
import { reportsAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

const REPORT_TYPES = [
  { key: 'blood_test', icon: 'droplet', label: 'Blood Test' },
  { key: 'xray', icon: 'image', label: 'X-Ray' },
  { key: 'mri', icon: 'cpu', label: 'MRI' },
  { key: 'prescription', icon: 'file-text', label: 'Prescription' },
  { key: 'ecg', icon: 'activity', label: 'ECG' },
  { key: 'other', icon: 'file', label: 'Other' },
];

export const UploadReportScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('blood_test');
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    try {
      const DocumentPicker = require('react-native-document-picker');
      const result = await DocumentPicker.default.pick({ type: [DocumentPicker.types.pdf, DocumentPicker.types.images] });
      setFile(result[0]);
    } catch (e: any) {
      if (!e?.message?.includes('cancel')) Alert.alert('Error', 'Could not pick file');
    }
  };

  const handleUpload = async () => {
    if (!file) { Alert.alert('Error', 'Please select a file'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', { uri: file.uri, type: file.type, name: file.name });
      formData.append('title', title || file.name);
      formData.append('type', type);
      await reportsAPI.upload(formData);
      Alert.alert('Success', 'Report uploaded.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch { Alert.alert('Error', 'Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Upload Report</Text>

      <Input label="Report Title (optional)" placeholder="e.g. CBC Blood Test" value={title} onChangeText={setTitle} />

      <Text style={s.label}>Report Type</Text>
      <View style={s.typeGrid}>
        {REPORT_TYPES.map(t => (
          <Pressable key={t.key} style={[s.typeChip, type === t.key && s.typeChipActive]} onPress={() => setType(t.key)}>
            <Icon name={t.icon} size={14} color={type === t.key ? '#FFF' : colors.textSecondary} />
            <Text style={[s.typeText, type === t.key && { color: '#FFF' }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.filePicker} onPress={pickFile}>
        {file ? (
          <View style={s.fileInfo}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={s.fileName}>{file.name}</Text>
            <Text style={s.fileSize}>{(file.size / 1024).toFixed(0)} KB</Text>
          </View>
        ) : (
          <View style={s.fileEmpty}>
            <Icon name="upload" size={24} color={colors.textTertiary} />
            <Text style={s.fileEmptyText}>Tap to select PDF or image</Text>
          </View>
        )}
      </Pressable>

      <Button title="Upload & Analyze" onPress={handleUpload} loading={uploading} disabled={!file} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { ...typography.screenTitle, color: colors.text, marginBottom: spacing.xl },
  label: { ...typography.meta, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.meta, color: colors.textSecondary },
  filePicker: {
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center',
  },
  fileInfo: { alignItems: 'center', gap: spacing.xs },
  fileName: { ...typography.cardTitle, color: colors.text },
  fileSize: { ...typography.meta, color: colors.textTertiary },
  fileEmpty: { alignItems: 'center', gap: spacing.sm },
  fileEmptyText: { ...typography.caption, color: colors.textTertiary },
});
