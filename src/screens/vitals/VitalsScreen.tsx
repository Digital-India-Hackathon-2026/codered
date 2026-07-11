import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Icon } from '../../components/shared/Icon';
import { StaggeredListItem } from '../../components/shared';
import { colors, radius, fonts } from '../../theme';
import { healthConnect, HealthData } from '../../services/healthConnect';

const SCREEN_W = Dimensions.get('window').width;
const METRIC_W = (SCREEN_W - 24 * 2 - 12) / 2;
const BAR_MAX_H = 120;
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const VitalsScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<HealthData | null>(null);
  const [hrHistory, setHrHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ), -1,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const loadData = useCallback(async () => {
    try {
      const available = await healthConnect.checkAvailability();
      console.log('HC availability:', available);
      if (available !== 'available') {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const inited = await healthConnect.init();
      console.log('HC init:', inited);
      if (!inited) { setLoading(false); return; }

      const hasPerm = await healthConnect.hasPermissions();
      console.log('HC permissions:', hasPerm);
      setHasPermission(hasPerm);

      if (hasPerm) {
        const healthData = await healthConnect.getHealthData();
        console.log('HC data:', JSON.stringify(healthData));
        setData(healthData);

        const stepsHistory = await healthConnect.getStepsHistory(7);
        console.log('HC steps history:', stepsHistory);
        setHrHistory(stepsHistory.map(d => d.steps));
      }
    } catch (e) {
      console.log('HC error:', e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const requestPermissions = async () => {
    const granted = await healthConnect.requestPermissions();
    if (granted) {
      setHasPermission(true);
      loadData();
    }
  };

  const shareWithVita = () => {
    if (!data) return;
    const summary = buildVitalsSummary(data);
    navigation.navigate('ChatTab', { screen: 'ChatTab' });
    // Small delay to let navigation complete, then we'll pass via params
    setTimeout(() => {
      navigation.navigate('Main', {
        screen: 'ChatTab',
        params: { prefill: `Here are my current vitals:\n${summary}\n\nPlease analyze and give me health insights.` },
      });
    }, 100);
  };

  const buildVitalsSummary = (d: HealthData): string => {
    const parts: string[] = [];
    if (d.heartRate) parts.push(`Heart Rate: ${d.heartRate.bpm} bpm`);
    if (d.steps > 0) parts.push(`Steps today: ${d.steps.toLocaleString()}`);
    if (d.sleep) parts.push(`Sleep: ${d.sleep.hours}h ${d.sleep.minutes}m`);
    if (d.spo2) parts.push(`SpO2: ${d.spo2}%`);
    if (d.calories > 0) parts.push(`Calories burned: ${Math.round(d.calories)} kcal`);
    if (d.distance > 0) parts.push(`Distance: ${(d.distance / 1000).toFixed(1)} km`);
    if (d.bloodPressure) parts.push(`Blood Pressure: ${d.bloodPressure.systolic}/${d.bloodPressure.diastolic} mmHg`);
    return parts.join('\n');
  };

  // Build metrics from real data
  const metrics = data ? [
    { icon: 'PersonSimpleWalk' as const, label: 'STEPS', value: data.steps.toLocaleString(), of: '8,000', pct: Math.min(100, Math.round((data.steps / 8000) * 100)), color: colors.coral },
    { icon: 'Moon' as const, label: 'SLEEP', value: data.sleep ? `${data.sleep.hours}:${data.sleep.minutes.toString().padStart(2, '0')}` : '--', of: '8h', pct: data.sleep ? Math.min(100, Math.round(((data.sleep.hours * 60 + data.sleep.minutes) / 480) * 100)) : 0, color: '#3B82F6' },
    { icon: 'Fire' as const, label: 'CALORIES', value: data.calories > 0 ? Math.round(data.calories).toString() : '--', of: '500 kcal', pct: Math.min(100, Math.round((data.calories / 500) * 100)), color: colors.amber },
    { icon: 'Drop' as const, label: 'SpO2', value: data.spo2 ? `${data.spo2}%` : '--', of: '95-100%', pct: data.spo2 ? Math.min(100, Math.round((data.spo2 / 100) * 100)) : 0, color: colors.sage },
  ] : [];

  const maxSteps = Math.max(...hrHistory, 1);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />}
      >
        <StaggeredListItem index={0}>
          <Text style={s.eyebrow}>TODAY</Text>
          <Text style={s.h1}>Vitals</Text>
        </StaggeredListItem>

        {/* Permission Request */}
        {!hasPermission && !loading && (
          <StaggeredListItem index={1}>
            <View style={s.permCard}>
              <Icon name="HeartHalf" size={32} color={colors.coral} weight="fill" />
              <Text style={s.permTitle}>Connect Health Data</Text>
              <Text style={s.permDesc}>Allow LifeLens to read your health data from Health Connect for real-time vitals.</Text>
              <Pressable style={s.permBtn} onPress={requestPermissions}>
                <Text style={s.permBtnText}>Grant Access</Text>
              </Pressable>
            </View>
          </StaggeredListItem>
        )}

        {/* Heart Rate Hero */}
        {hasPermission && (
          <StaggeredListItem index={1}>
            <View style={s.heroCard}>
              <View style={s.heroTop}>
                <View style={s.heroLabel}>
                  <Icon name="Heartbeat" size={18} color={colors.coral} weight="fill" />
                  <Text style={s.heroLabelText}>Heart rate</Text>
                </View>
                {data?.heartRate && (
                  <View style={s.restingPill}>
                    <Text style={s.restingText}>LATEST</Text>
                  </View>
                )}
              </View>

              <View style={s.heroValueRow}>
                {data?.heartRate ? (
                  <>
                    <Animated.View style={pulseStyle}>
                      <Text style={s.heroValue}>{data.heartRate.bpm}</Text>
                    </Animated.View>
                    <Text style={s.heroUnit}>bpm</Text>
                  </>
                ) : (
                  <Text style={s.noData}>No heart rate data</Text>
                )}
              </View>

              {/* Steps bar chart (7 days) */}
              {hrHistory.length > 0 && (
                <View style={s.barsContainer}>
                  {hrHistory.map((v, i) => {
                    const h = Math.max(8, Math.round((v / maxSteps) * BAR_MAX_H));
                    const isToday = i === hrHistory.length - 1;
                    return (
                      <View key={i} style={s.barCol}>
                        <View style={s.barTrack}>
                          {isToday ? (
                            <LinearGradient
                              colors={colors.gradient.coralAmber}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={[s.barFill, { height: h }]}
                            />
                          ) : (
                            <View style={[s.barFill, s.barInactive, { height: h }]} />
                          )}
                        </View>
                        <Text style={[s.dayLabel, isToday && s.dayLabelActive]}>{DAYS[i]}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </StaggeredListItem>
        )}

        {/* Metric Grid */}
        {hasPermission && metrics.length > 0 && (
          <StaggeredListItem index={2}>
            <View style={s.grid}>
              {metrics.map(m => (
                <View key={m.label} style={s.metricCard}>
                  <Icon name={m.icon} size={18} color={m.color} weight="fill" />
                  <Text style={s.metricLabel}>{m.label}</Text>
                  <Text style={s.metricValue}>{m.value}</Text>
                  <Text style={s.metricOf}>{m.of}</Text>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${m.pct}%`, backgroundColor: m.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </StaggeredListItem>
        )}

        {/* Blood Pressure */}
        {hasPermission && data?.bloodPressure && (
          <StaggeredListItem index={3}>
            <View style={s.bpCard}>
              <Icon name="Activity" size={18} color="#8B5CF6" weight="fill" />
              <View style={{ flex: 1 }}>
                <Text style={s.bpLabel}>Blood Pressure</Text>
                <Text style={s.bpValue}>{data.bloodPressure.systolic}/{data.bloodPressure.diastolic} <Text style={s.bpUnit}>mmHg</Text></Text>
              </View>
            </View>
          </StaggeredListItem>
        )}

        {/* Share with Vita */}
        {hasPermission && data && (
          <StaggeredListItem index={4}>
            <Pressable style={s.shareCard} onPress={shareWithVita}>
              <View style={s.shareIcon}>
                <Icon name="ChatCircle" size={20} color={colors.coral} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.shareTitle}>Share vitals with Vita</Text>
                <Text style={s.shareDesc}>Send your health data to AI for personalized insights</Text>
              </View>
              <Icon name="ArrowRight" size={18} color={colors.textTertiary} weight="regular" />
            </Pressable>
          </StaggeredListItem>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12 },

  eyebrow: { fontFamily: fonts.generalSans.semiBold, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary, marginBottom: 4 },
  h1: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34, color: colors.text, marginBottom: 20 },

  // Permission card
  permCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginBottom: 16 },
  permTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text, marginTop: 12 },
  permDesc: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  permBtn: { marginTop: 16, backgroundColor: colors.coral, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 12 },
  permBtnText: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.textInverse },

  // Hero card
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLabelText: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.textSecondary },
  restingPill: { backgroundColor: '#D1FAE5', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  restingText: { fontFamily: fonts.generalSans.semiBold, fontSize: 10, color: colors.sage, letterSpacing: 0.5 },
  heroValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, marginBottom: 20 },
  heroValue: { fontFamily: fonts.fraunces.bold, fontSize: 56, color: colors.text },
  heroUnit: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textTertiary, marginLeft: 6 },
  noData: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textTertiary, marginTop: 8 },

  // Bars
  barsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { height: BAR_MAX_H, justifyContent: 'flex-end', width: '100%' },
  barFill: { width: '100%', borderRadius: radius.sm },
  barInactive: { backgroundColor: colors.surfaceSunken },
  dayLabel: { fontFamily: fonts.generalSans.medium, fontSize: 10, color: colors.textTertiary, marginTop: 6 },
  dayLabelActive: { color: colors.coral },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  metricCard: { width: METRIC_W, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  metricLabel: { fontFamily: fonts.generalSans.semiBold, fontSize: 10, letterSpacing: 1, color: colors.textTertiary, marginTop: 10 },
  metricValue: { fontFamily: fonts.fraunces.semiBold, fontSize: 24, color: colors.text, marginTop: 4 },
  metricOf: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceSunken, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },

  // Blood Pressure
  bpCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  bpLabel: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.textTertiary },
  bpValue: { fontFamily: fonts.fraunces.semiBold, fontSize: 20, color: colors.text, marginTop: 2 },
  bpUnit: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary },

  // Share with Vita
  shareCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.coralSoft, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.coral + '30', marginTop: 4 },
  shareIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  shareTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  shareDesc: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
