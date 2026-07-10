import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl,
  StatusBar, Alert, Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { healthConnect, HealthData } from '../../services/healthConnect';

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
        'Please install or update Health Connect from Play Store to sync your watch data.',
        [{ text: 'Open Play Store', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata') },
         { text: 'Cancel' }]
      );
      setLoading(false);
      return;
    }

    if (availability === 'unavailable') {
      setLoading(false);
      return;
    }

    const inited = await healthConnect.init();
    if (!inited) { setLoading(false); return; }

    const granted = await healthConnect.requestPermissions();
    setConnected(granted);

    if (granted) {
      const healthData = await healthConnect.getHealthData();
      setData(healthData);
      const history = await healthConnect.getStepsHistory(7);
      setStepsHistory(history);
    }

    setLoading(false);
  }, []);

  useEffect(() => { checkAndLoad(); }, [checkAndLoad]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (connected) {
      const healthData = await healthConnect.getHealthData();
      setData(healthData);
      const history = await healthConnect.getStepsHistory(7);
      setStepsHistory(history);
    }
    setRefreshing(false);
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const maxSteps = Math.max(...stepsHistory.map(d => d.steps), 1);

  if (loading) {
    return (
      <View style={s.center}>
        <Text style={s.loadingEmoji}>⌚</Text>
        <Text style={s.loadingText}>Connecting to Health Connect...</Text>
      </View>
    );
  }

  if (!connected) {
    return (
      <View style={s.center}>
        <Text style={s.emptyEmoji}>⌚</Text>
        <Text style={s.emptyTitle}>Connect Your Watch</Text>
        <Text style={s.emptyDesc}>
          Sync your Fireboltt watch data via Google Health Connect to see live heart rate, steps, sleep & more.
        </Text>

        <View style={s.stepsCard}>
          <Text style={s.stepItem}>1️⃣  Open <Text style={s.bold}>Fireboltt app</Text> on your phone</Text>
          <Text style={s.stepItem}>2️⃣  Go to <Text style={s.bold}>Device → Health Monitoring</Text></Text>
          <Text style={s.stepItem}>3️⃣  Enable <Text style={s.bold}>"Sync to Health Connect"</Text></Text>
          <Text style={s.stepItem}>4️⃣  Come back here and tap Connect</Text>
        </View>

        <Pressable style={s.connectBtn} onPress={checkAndLoad}>
          <Text style={s.connectBtnText}>🔗 Connect Health Connect</Text>
        </Pressable>

        <Pressable style={s.secondaryBtn} onPress={() => healthConnect.openHealthConnectSettings()}>
          <Text style={s.secondaryBtnText}>Open Health Connect Settings</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={{ height: StatusBar.currentHeight || 0, backgroundColor: '#F8FAFC' }} />
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7FF9" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Live Vitals ⌚</Text>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>Synced</Text>
          </View>
        </View>

        {/* Heart Rate - Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={s.hrCard}>
            <View style={s.hrHeader}>
              <Text style={s.hrEmoji}>❤️</Text>
              <Text style={s.hrLabel}>Heart Rate</Text>
              {data?.heartRate && <Text style={s.hrTime}>{formatTime(data.heartRate.time)}</Text>}
            </View>
            <View style={s.hrValueRow}>
              <Text style={s.hrValue}>{data?.heartRate?.bpm || '--'}</Text>
              <Text style={s.hrUnit}>bpm</Text>
            </View>
            <View style={s.hrStatus}>
              <Text style={s.hrStatusText}>
                {data?.heartRate ? (data.heartRate.bpm < 60 ? '🔵 Low' : data.heartRate.bpm > 100 ? '🔴 High' : '🟢 Normal') : 'No data'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Vitals Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={s.grid}>
            {/* Steps */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>🚶</Text>
              <Text style={s.vitalLabel}>Steps</Text>
              <Text style={s.vitalValue}>{data?.steps?.toLocaleString() || '0'}</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${Math.min((data?.steps || 0) / 10000 * 100, 100)}%` }]} />
              </View>
              <Text style={s.vitalGoal}>Goal: 10,000</Text>
            </View>

            {/* Sleep */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>😴</Text>
              <Text style={s.vitalLabel}>Sleep</Text>
              <Text style={s.vitalValue}>
                {data?.sleep ? `${data.sleep.hours}h ${data.sleep.minutes}m` : '--'}
              </Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${Math.min(((data?.sleep?.hours || 0) * 60 + (data?.sleep?.minutes || 0)) / 480 * 100, 100)}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
              <Text style={s.vitalGoal}>Goal: 8h</Text>
            </View>

            {/* SpO2 */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>🫁</Text>
              <Text style={s.vitalLabel}>SpO2</Text>
              <Text style={s.vitalValue}>{data?.spo2 ? `${data.spo2}%` : '--'}</Text>
              <Text style={[s.vitalStatus, { color: data?.spo2 && data.spo2 >= 95 ? '#16A34A' : '#F59E0B' }]}>
                {data?.spo2 ? (data.spo2 >= 95 ? 'Normal' : 'Low') : 'No data'}
              </Text>
            </View>

            {/* Calories */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>🔥</Text>
              <Text style={s.vitalLabel}>Calories</Text>
              <Text style={s.vitalValue}>{Math.round(data?.calories || 0)}</Text>
              <Text style={s.vitalGoal}>kcal burned</Text>
            </View>

            {/* Distance */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>📍</Text>
              <Text style={s.vitalLabel}>Distance</Text>
              <Text style={s.vitalValue}>{((data?.distance || 0) / 1000).toFixed(1)} km</Text>
              <Text style={s.vitalGoal}>today</Text>
            </View>

            {/* Blood Pressure */}
            <View style={s.vitalCard}>
              <Text style={s.vitalEmoji}>🩸</Text>
              <Text style={s.vitalLabel}>Blood Pressure</Text>
              <Text style={s.vitalValue}>
                {data?.bloodPressure ? `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}` : '--'}
              </Text>
              <Text style={s.vitalGoal}>mmHg</Text>
            </View>
          </View>
        </Animated.View>

        {/* Steps History Chart */}
        {stepsHistory.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={s.sectionTitle}>Steps - Last 7 Days</Text>
            <View style={s.chartCard}>
              <View style={s.chartBars}>
                {stepsHistory.map((day, i) => (
                  <View key={day.date} style={s.chartCol}>
                    <Text style={s.chartValue}>{day.steps > 0 ? (day.steps / 1000).toFixed(1) + 'k' : '0'}</Text>
                    <View style={s.chartBarBg}>
                      <View style={[s.chartBarFill, { height: `${(day.steps / maxSteps) * 100}%` }]} />
                    </View>
                    <Text style={s.chartDay}>
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short' }).slice(0, 2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Send to Clary */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Pressable
            style={s.claryCard}
            onPress={() => {
              const summary = `My vitals today: HR ${data?.heartRate?.bpm || 'N/A'} bpm, Steps ${data?.steps || 0}, Sleep ${data?.sleep ? `${data.sleep.hours}h ${data.sleep.minutes}m` : 'N/A'}, SpO2 ${data?.spo2 || 'N/A'}%`;
              navigation.navigate('ChatTab', { prefill: summary });
            }}
          >
            <Text style={s.claryEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.claryTitle}>Ask Clary about your vitals</Text>
              <Text style={s.clarySub}>Get AI insights based on your watch data</Text>
            </View>
            <Text style={s.claryArrow}>→</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: '#F8FAFC' },

  // Loading
  loadingEmoji: { fontSize: 48, marginBottom: 16 },
  loadingText: { fontSize: 16, color: '#6B7280' },

  // Empty state
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  connectBtn: { backgroundColor: '#2D7FF9', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14, marginBottom: 12 },
  connectBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginBottom: 16 },
  secondaryBtnText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  stepsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, width: '100%', gap: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  stepItem: { fontSize: 14, color: '#374151', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#111827' },
  setupHint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  liveText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },

  // Heart Rate Hero
  hrCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  hrHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  hrEmoji: { fontSize: 20 },
  hrLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', flex: 1 },
  hrTime: { fontSize: 12, color: '#9CA3AF' },
  hrValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hrValue: { fontSize: 52, fontWeight: '800', color: '#EF4444' },
  hrUnit: { fontSize: 18, color: '#9CA3AF', fontWeight: '500' },
  hrStatus: { marginTop: 8 },
  hrStatusText: { fontSize: 14, fontWeight: '600', color: '#374151' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  vitalCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  vitalEmoji: { fontSize: 24, marginBottom: 6 },
  vitalLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 },
  vitalValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  vitalGoal: { fontSize: 11, color: '#9CA3AF' },
  vitalStatus: { fontSize: 12, fontWeight: '600' },
  progressBar: { width: '100%', height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 4, backgroundColor: '#2D7FF9', borderRadius: 2 },

  // Chart
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  chartCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartValue: { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  chartBarBg: { width: 24, height: 90, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBarFill: { width: '100%', backgroundColor: '#2D7FF9', borderRadius: 12 },
  chartDay: { fontSize: 11, color: '#6B7280', marginTop: 6, fontWeight: '600' },

  // Clary card
  claryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF4FF', borderRadius: 20, padding: 16, gap: 12, borderWidth: 1, borderColor: '#D6EBFF' },
  claryEmoji: { fontSize: 28 },
  claryTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  clarySub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  claryArrow: { fontSize: 20, color: '#2D7FF9', fontWeight: '600' },
});
