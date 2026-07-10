import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState, Button } from '../../components/UI';
import { reportsAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

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

  const handleUpload = () => navigation.navigate('UploadReport');

  const handleAnalyze = async (id: string) => {
    try {
      await reportsAPI.analyze(id);
      Alert.alert('Analysis Started', 'AI is analyzing your report. Check back in a moment.');
      loadReports();
    } catch {
      Alert.alert('Error', 'Could not start analysis');
    }
  };

  const renderReport = ({ item }: { item: any }) => (
    <Card style={styles.reportCard} onPress={() => navigation.navigate('ReportDetail', { report: item })}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <Text style={{ fontSize: 24 }}>{getReportIcon(item.type)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle}>{item.title || item.filename}</Text>
          <Text style={styles.reportDate}>
            {new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Badge
          text={item.analyzed ? 'Analyzed' : 'Pending'}
          color={item.analyzed ? colors.secondary : colors.textTertiary}
        />
      </View>
      {item.summary && (
        <Text style={styles.reportSummary} numberOfLines={2}>{item.summary}</Text>
      )}
      {item.abnormal_count > 0 && (
        <View style={styles.abnormalBadge}>
          <Text style={styles.abnormalText}>⚠️ {item.abnormal_count} abnormal value{item.abnormal_count > 1 ? 's' : ''}</Text>
        </View>
      )}
      {!item.analyzed && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={() => handleAnalyze(item.id)}>
          <Text style={styles.analyzeBtnText}>🤖 Analyze with AI</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Medical Reports</Text>
        <Button title="+ Upload" onPress={handleUpload} style={styles.uploadBtn} />
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="📋"
              title="No reports yet"
              subtitle="Upload your blood tests, scans, or prescriptions for AI analysis"
            />
          ) : null
        }
      />
    </View>
  );
};

const getReportIcon = (type: string) => {
  const map: Record<string, string> = {
    blood_test: '🩸', xray: '🦴', mri: '🧠', ct_scan: '📡',
    prescription: '💊', ecg: '❤️', ultrasound: '📺',
  };
  return map[type] || '📄';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg,
  },
  screenTitle: { ...typography.h1, color: colors.text },
  uploadBtn: { height: 40, paddingHorizontal: spacing.lg },
  list: { padding: spacing.lg, paddingBottom: 100 },
  reportCard: { marginBottom: spacing.md },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reportIcon: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  reportTitle: { ...typography.bodyBold, color: colors.text },
  reportDate: { ...typography.caption, color: colors.textSecondary },
  reportSummary: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  abnormalBadge: {
    marginTop: spacing.sm, backgroundColor: colors.danger + '10',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignSelf: 'flex-start',
  },
  abnormalText: { ...typography.small, color: colors.danger, fontWeight: '600' },
  analyzeBtn: {
    marginTop: spacing.sm, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  analyzeBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600', textAlign: 'center' },
});
