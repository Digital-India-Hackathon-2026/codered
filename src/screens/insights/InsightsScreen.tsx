import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState } from '../../components/UI';
import { Icon } from '../../components/shared';
import { insightsAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

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

  const getSeverityColor = (severity: string) => {
    if (severity === 'high' || severity === 'critical') return colors.danger;
    if (severity === 'moderate') return colors.warning;
    return colors.textSecondary;
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
    >
      <Text style={s.screenTitle}>Insights</Text>
      <Text style={s.subtitle}>Based on your health data</Text>

      {risks.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Icon name="alert-triangle" size={16} color={colors.danger} />
            <Text style={s.sectionTitle}>Risk Alerts</Text>
          </View>
          {risks.map((risk, i) => (
            <Card key={i} style={{...s.riskCard, borderLeftColor: getSeverityColor(risk.severity)}}>
              <View style={s.riskHeader}>
                <Text style={s.riskTitle}>{risk.title}</Text>
                <Badge text={risk.severity} color={getSeverityColor(risk.severity)} />
              </View>
              <Text style={s.riskBody}>{risk.description}</Text>
              {risk.action && <Text style={s.riskAction}>{risk.action}</Text>}
            </Card>
          ))}
        </View>
      )}

      {checkups.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Icon name="calendar" size={16} color={colors.textSecondary} />
            <Text style={s.sectionTitle}>Checkups Due</Text>
          </View>
          {checkups.map((item, i) => (
            <Card key={i} style={s.checkupCard}>
              <Text style={s.checkupName}>{item.name}</Text>
              <Text style={s.checkupInfo}>Last: {item.last_done || 'Never'} · {item.frequency}</Text>
            </Card>
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Icon name="info" size={16} color={colors.textSecondary} />
            <Text style={s.sectionTitle}>Recommendations</Text>
          </View>
          {recommendations.map((rec, i) => (
            <Card key={i} style={s.recCard}>
              <Text style={s.recTitle}>{rec.title}</Text>
              <Text style={s.recBody}>{rec.description}</Text>
            </Card>
          ))}
        </View>
      )}

      {risks.length === 0 && recommendations.length === 0 && checkups.length === 0 && (
        <EmptyState icon="" title="No insights yet" subtitle="Add health data to get personalized insights" />
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: 100 },
  screenTitle: { ...typography.screenTitle, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { ...typography.sectionTitle, color: colors.text },
  riskCard: { marginBottom: spacing.sm, borderLeftWidth: 3 },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  riskTitle: { ...typography.cardTitle, color: colors.text, flex: 1 },
  riskBody: { ...typography.caption, color: colors.textSecondary },
  riskAction: { ...typography.caption, color: colors.primary, fontWeight: '500', marginTop: spacing.sm },
  checkupCard: { marginBottom: spacing.sm },
  checkupName: { ...typography.cardTitle, color: colors.text },
  checkupInfo: { ...typography.meta, color: colors.textTertiary, marginTop: 2 },
  recCard: { marginBottom: spacing.sm },
  recTitle: { ...typography.cardTitle, color: colors.text },
  recBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
