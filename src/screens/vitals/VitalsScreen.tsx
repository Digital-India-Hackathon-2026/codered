import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  StatusBar, Alert, Linking, Pressable,
} from 'react-native';
import { healthConnect, HealthData } from '../../services/healthConnect';
import { colors, spacing, radius, typography } from '../../theme';
import { Icon } from '../../components/shared';

export const VitalsScreen = ({ navigation }: any) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<HealthData | null>(null);
  const [stepsHistory, setStepsHistory] = useState<{ date: string; steps: number }[]>([]);

  const checkAndLoad = useCallback(async () => {
    const availability = await healthConnect.checkAvailability();
    if (availability === 'not_installed') {
      Alert.alert(
        'Health Connect Required',
        'Please install or update Health Connect from Play Store.',
        [{ text: 'Open Play Store', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata') },
         { text: 'Cancel' }],
      );
      setLoading(false);
      return;
    }
    if (availability === 'unavailable') { setLoading(false); return; }
    const inited = await healthConnect.init();
    if (!inited) { setLoading(false); return; }
    const granted = await healthConnect.requestPermissions();
    setConnected(granted);
    if (granted) {
      setData(await healthConnect.getHealthData());
      setStepsHistory(await healthConnect.getStepsHistory(7));
    }
    setLoading(false);
  }, []);

  useEffect(() => { checkAndLoad(); }, [checkAndLoad]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (connected) {
      setData(await healthConnect.getHealthData());
      setStepsHistory(await healthConnect.getStepsHistory(7));
    }
    setRefreshing(false);
  };

  const formatTime = (t: string) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const maxSteps = Math.max(...stepsHistory.map(d => d.steps), 1);

  if (loading) {
    return (
      <View style={s.center}>
        <Icon name="watch" size={32} color={colors.textTertiary} />
        <Text style={s.loadingText}>Connecting...</Text>
      </View>
    );
  }

  if (!connected) {
    return (
      <View style={s.center}>
        <Icon name="watch" size={32} color={colors.textSecondary} />
        <Text style={s.emptyTitle}>Connect Your Watch</Text>
        <Text style={s.emptyDesc}>Sync via Google Health Connect to see live vitals.</Text>
        <Pressable style={s.primaryBtn} onPress={checkAndLoad}>
          <Text style={s.primaryBtnText}>Connect</Text>
        </Pressable>
        <Pressable style={s.secondaryBtn} onPress={() => healthConnect.openHealthConnectSettings()}>
          <Text style={s.secondaryBtnText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Vitals</Text>
          <View style={s.syncBadge}>
            <View style={s.syncDot} />
            <Text style={s.syncText}>Synced</Text>
          </View>
        </View>

        {/* Heart Rate */}
        <View style={s.hrCard}>
          <View style={s.hrTop}>
            <Icon name="heart" size={16} color={colors.danger} />
            <Text style={s.hrLabel}>Heart Rate</Text>
            {data?.heartRate && <Text style={s.hrTime}>{formatTime(data.heartRate.time)}</Text>}
          </View>
          <View style={s.hrValueRow}>
            <Text style={s.hrValue}>{data?.heartRate?.bpm || '--'}</Text>
            <Text style={s.hrUnit}>bpm</Text>
          </View>
          {data?.heartRate && (
            <Text style={[s.hrStatus, {
              color: data.heartRate.bpm > 100 ? colors.danger : data.heartRate.bpm < 60 ? colors.warning : colors.success
            }]}>
              {data.heartRate.bpm > 100 ? 'High' : data.heartRate.bpm < 60 ? 'Low' : 'Normal'}
            </Text>
          )}
        </View>

        {/* Grid */}
        <View style={s.grid}>
          <View style={s.vitalCard}>
            <Icon name="trending-up" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>Steps</Text>
            <Text style={s.vValue}>{data?.steps?.toLocaleString() || '0'}</Text>
            <View style={s.bar}><View style={[s.barFill, { width: `${Math.min((data?.steps || 0) / 10000 * 100, 100)}%` }]} /></View>
          </View>
          <View style={s.vitalCard}>
            <Icon name="moon" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>Sleep</Text>
            <Text style={s.vValue}>{data?.sleep ? `${data.sleep.hours}h ${data.sleep.minutes}m` : '--'}</Text>
            <View style={s.bar}><View style={[s.barFill, { width: `${Math.min(((data?.sleep?.hours || 0) * 60 + (data?.sleep?.minutes || 0)) / 480 * 100, 100)}%` }]} /></View>
          </View>
          <View style={s.vitalCard}>
            <Icon name="wind" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>SpO2</Text>
            <Text style={s.vValue}>{data?.spo2 ? `${data.spo2}%` : '--'}</Text>
            {data?.spo2 && <Text style={[s.vStatus, { color: data.spo2 >= 95 ? colors.success : colors.warning }]}>{data.spo2 >= 95 ? 'Normal' : 'Low'}</Text>}
          </View>
          <View style={s.vitalCard}>
            <Icon name="zap" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>Calories</Text>
            <Text style={s.vValue}>{Math.round(data?.calories || 0)}</Text>
            <Text style={s.vMeta}>kcal</Text>
          </View>
          <View style={s.vitalCard}>
            <Icon name="map-pin" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>Distance</Text>
            <Text style={s.vValue}>{((data?.distance || 0) / 1000).toFixed(1)} km</Text>
          </View>
          <View style={s.vitalCard}>
            <Icon name="activity" size={16} color={colors.textSecondary} />
            <Text style={s.vLabel}>Blood Pressure</Text>
            <Text style={s.vValue}>{data?.bloodPressure ? `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}` : '--'}</Text>
            <Text style={s.vMeta}>mmHg</Text>
          </View>
        </View>

        {/* Steps Chart */}
        {stepsHistory.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Steps — 7 days</Text>
            <View style={s.chartCard}>
              <View style={s.chartBars}>
                {stepsHistory.map((day, i) => {
                  const pct = (day.steps / maxSteps) * 100;
                  const isToday = i === stepsHistory.length - 1;
                  return (
                    <View key={day.date} style={s.chartCol}>
                      <Text style={s.chartVal}>{day.steps > 0 ? (day.steps / 1000).toFixed(1) + 'k' : '0'}</Text>
                      <View style={s.chartBarBg}>
                        <View style={[s.chartBarFill, { height: `${pct}%`, backgroundColor: isToday ? colors.primary : '#D4D4D8' }]} />
                      </View>
                      <Text style={[s.chartDay, isToday && { color: colors.primary, fontWeight: '600' }]}>
                        {new Date(day.date).toLocaleDateString([], { weekday: 'short' }).slice(0, 2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Ask Clary */}
        <Pressable
          style={s.claryCard}
          onPress={() => {
            const summary = `My vitals: HR ${data?.heartRate?.bpm || 'N/A'} bpm, Steps ${data?.steps || 0}, Sleep ${data?.sleep ? `${data.sleep.hours}h ${data.sleep.minutes}m` : 'N/A'}, SpO2 ${data?.spo2 || 'N/A'}%`;
            navigation.navigate('ChatTab', { prefill: summary });
          }}
        >
          <Icon name="message-circle" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.claryTitle}>Ask Clary about your vitals</Text>
          </View>
          <Icon name="arrow-right" size={16} color={colors.textTertiary} />
        </Pressable>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], backgroundColor: colors.background, gap: spacing.sm },

  loadingText: { ...typography.caption, color: colors.textTertiary },
  emptyTitle: { ...typography.cardTitle, color: colors.text, fontWeight: '600', marginTop: spacing.md },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.lg },
  primaryBtnText: { ...typography.cardTitle, color: '#FFF' },
  secondaryBtn: { marginTop: spacing.sm },
  secondaryBtnText: { ...typography.caption, color: colors.textSecondary },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.screenTitle, color: colors.text },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  syncText: { ...typography.meta, color: colors.textSecondary },

  hrCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3, borderLeftColor: colors.danger,
  },
  hrTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  hrLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  hrTime: { ...typography.meta, color: colors.textTertiary },
  hrValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  hrValue: { fontSize: 40, fontWeight: '700', color: colors.text },
  hrUnit: { ...typography.caption, color: colors.textTertiary },
  hrStatus: { ...typography.meta, fontWeight: '500', marginTop: spacing.xs },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  vitalCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.xs,
  },
  vLabel: { ...typography.meta, color: colors.textSecondary },
  vValue: { fontSize: 18, fontWeight: '600', color: colors.text },
  vMeta: { ...typography.meta, color: colors.textTertiary },
  vStatus: { ...typography.meta, fontWeight: '500' },
  bar: { height: 3, backgroundColor: '#F4F4F5', borderRadius: 2, marginTop: spacing.xs },
  barFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },

  sectionTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: spacing.md },
  chartCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartVal: { ...typography.meta, color: colors.textTertiary, marginBottom: spacing.xs },
  chartBarBg: { width: 20, height: 80, backgroundColor: '#F4F4F5', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBarFill: { width: '100%', borderRadius: 4 },
  chartDay: { ...typography.meta, color: colors.textSecondary, marginTop: spacing.sm },

  claryCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  claryTitle: { ...typography.cardTitle, color: colors.text },
});
