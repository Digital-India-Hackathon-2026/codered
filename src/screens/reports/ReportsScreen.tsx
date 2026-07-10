import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState, Button } from '../../components/UI';
import { Icon } from '../../components/shared';
import { reportsAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

export const ReportsScreen = ({ navigation }: any) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      const { data } = await reportsAPI.getAll();
      setReports(data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadReports(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadReports(); setRefreshing(false); };

  const handleAnalyze = async (id: string) => {
    try {
      await reportsAPI.analyze(id);
      Alert.alert('Analysis Started', 'AI is analyzing your report.');
      loadReports();
    } catch { Alert.alert('Error', 'Could not start analysis'); }
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      blood_test: 'droplet', xray: 'image', mri: 'cpu', ct_scan: 'monitor',
      prescription: 'file-text', ecg: 'activity', ultrasound: 'radio',
    };
    return map[type] || 'file';
  };

  const renderReport = ({ item }: { item: any }) => (
    <Card style={s.reportCard}>
      <View style={s.reportHeader}>
        <View style={s.reportIcon}>
          <Icon name={getIcon(item.type)} size={18} color={colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.reportTitle}>{item.title || item.filename}</Text>
          <Text style={s.reportDate}>
            {new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Badge text={item.analyzed ? 'Analyzed' : 'Pending'} color={item.analyzed ? colors.success : colors.textTertiary} />
      </View>
      {item.summary && <Text style={s.reportSummary} numberOfLines={2}>{item.summary}</Text>}
      {item.abnormal_count > 0 && (
        <View style={s.abnormalRow}>
          <Icon name="alert-triangle" size={12} color={colors.danger} />
          <Text style={s.abnormalText}>{item.abnormal_count} abnormal value{item.abnormal_count > 1 ? 's' : ''}</Text>
        </View>
      )}
      {!item.analyzed && (
        <Pressable style={s.analyzeBtn} onPress={() => handleAnalyze(item.id)}>
          <Text style={s.analyzeBtnText}>Analyze with AI</Text>
        </Pressable>
      )}
    </Card>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Reports</Text>
        <Pressable style={s.uploadBtn} onPress={() => navigation.navigate('UploadReport')}>
          <Icon name="plus" size={16} color="#FFF" />
          <Text style={s.uploadBtnText}>Upload</Text>
        </Pressable>
      </View>
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
        ListEmptyComponent={!loading ? <EmptyState icon="" title="No reports" subtitle="Upload blood tests, scans, or prescriptions for AI analysis" /> : null}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing['2xl'] },
  screenTitle: { ...typography.screenTitle, color: colors.text },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  uploadBtnText: { ...typography.meta, color: '#FFF', fontWeight: '500' },
  list: { padding: spacing.lg, paddingBottom: 100 },
  reportCard: { marginBottom: spacing.sm },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reportIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center' },
  reportTitle: { ...typography.cardTitle, color: colors.text },
  reportDate: { ...typography.meta, color: colors.textTertiary, marginTop: 1 },
  reportSummary: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  abnormalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  abnormalText: { ...typography.meta, color: colors.danger, fontWeight: '500' },
  analyzeBtn: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  analyzeBtnText: { ...typography.caption, color: colors.primary, fontWeight: '500', textAlign: 'center' },
});
