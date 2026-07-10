import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState } from '../../components/UI';
import { insightsAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius } from '../../theme';

export const InsightsScreen = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [checkups, setCheckups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [r, rec, c] = await Promise.allSettled([
      insightsAPI.getRisks(),
      insightsAPI.getRecommendations(),
      insightsAPI.getCheckupDue(),
    ]);
    if (r.status === 'fulfilled') setRisks(r.value.data || []);
    if (rec.status === 'fulfilled') setRecommendations(rec.value.data || []);
    if (c.status === 'fulfilled') setCheckups(c.value.data || []);
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.screenTitle}>Health Insights</Text>
      <Text style={styles.subtitle}>AI-powered analysis based on your health data</Text>

      {/* Risk Alerts */}
      {risks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Risk Alerts</Text>
          {risks.map((risk, i) => (
            <Card key={i} style={{...styles.riskCard, borderLeftColor: colors.severity[risk.severity as keyof typeof colors.severity] || colors.warning}}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>{risk.title}</Text>
                <Badge text={risk.severity} color={colors.severity[risk.severity as keyof typeof colors.severity] || colors.warning} />
              </View>
              <Text style={styles.riskBody}>{risk.description}</Text>
              {risk.action && <Text style={styles.riskAction}>→ {risk.action}</Text>}
            </Card>
          ))}
        </View>
      )}

      {/* Checkups Due */}
      {checkups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Checkups Due</Text>
          {checkups.map((item, i) => (
            <Card key={i} style={styles.checkupCard}>
              <Text style={styles.checkupName}>{item.name}</Text>
              <Text style={styles.checkupInfo}>Last: {item.last_done || 'Never'} • Recommended: {item.frequency}</Text>
            </Card>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Recommendations</Text>
          {recommendations.map((rec, i) => (
            <Card key={i} style={styles.recCard}>
              <Text style={styles.recIcon}>{rec.icon || '💡'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recBody}>{rec.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {risks.length === 0 && recommendations.length === 0 && checkups.length === 0 && (
        <EmptyState icon="🧠" title="No insights yet" subtitle="Add health data to get personalized insights" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  screenTitle: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  riskCard: { marginBottom: spacing.sm, borderLeftWidth: 4 },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  riskTitle: { ...typography.bodyBold, color: colors.text, flex: 1 },
  riskBody: { ...typography.caption, color: colors.textSecondary },
  riskAction: { ...typography.caption, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  checkupCard: { marginBottom: spacing.sm },
  checkupName: { ...typography.bodyBold, color: colors.text },
  checkupInfo: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  recCard: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  recIcon: { fontSize: 24 },
  recTitle: { ...typography.bodyBold, color: colors.text },
  recBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
