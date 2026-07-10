import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Button, Input, Card } from '../../components/UI';
import { reportsAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius } from '../../theme';

const REPORT_TYPES = [
  { key: 'blood_test', label: '🩸 Blood Test' },
  { key: 'xray', label: '🦴 X-Ray' },
  { key: 'mri', label: '🧠 MRI' },
  { key: 'prescription', label: '💊 Prescription' },
  { key: 'ecg', label: '❤️ ECG' },
  { key: 'other', label: '📄 Other' },
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
      Alert.alert('Success', 'Report uploaded! AI analysis will begin shortly.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Report</Text>

      <Input label="Report Title (optional)" placeholder="e.g. CBC Blood Test - June 2025" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Report Type</Text>
      <View style={styles.typeGrid}>
        {REPORT_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[styles.typeChip, type === t.key && styles.typeChipActive]} onPress={() => setType(t.key)}>
            <Text style={[styles.typeText, type === t.key && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
        {file ? (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</Text>
          </View>
        ) : (
          <View style={styles.fileEmpty}>
            <Text style={{ fontSize: 32 }}>📎</Text>
            <Text style={styles.fileEmptyText}>Tap to select PDF or Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Button title="Upload & Analyze" onPress={handleUpload} loading={uploading} disabled={!file} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xxl },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xxl },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  typeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.caption, color: colors.textSecondary },
  filePicker: {
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: borderRadius.lg, padding: spacing.xxl, marginBottom: spacing.xxl, alignItems: 'center',
  },
  fileInfo: { alignItems: 'center' },
  fileName: { ...typography.bodyBold, color: colors.text },
  fileSize: { ...typography.caption, color: colors.textSecondary },
  fileEmpty: { alignItems: 'center' },
  fileEmptyText: { ...typography.body, color: colors.textTertiary, marginTop: spacing.sm },
});
