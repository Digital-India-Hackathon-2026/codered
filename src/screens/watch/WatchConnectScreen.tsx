import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Vibration,
} from 'react-native';
import { useWatchBLE } from '../../hooks/useWatchBLE';
import { WatchDevice } from '../../services/bleWatchService';
import { Icon } from '../../components/shared';
import { colors, spacing, radius, typography } from '../../theme';

export const WatchConnectScreen = ({ navigation }: any) => {
  const {
    isScanning, isConnected, connectedDevice, lastHeartRate, batteryLevel,
    devices, heartRateHistory, error, scan, connect, disconnect, getAverageHR, getMinMaxHR,
  } = useWatchBLE();

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (device: WatchDevice) => {
    setConnecting(device.id);
    Vibration.vibrate(20);
    const success = await connect(device.id);
    if (success) Vibration.vibrate(50);
    setConnecting(null);
  };

  const getHRColor = (bpm: number) => {
    if (bpm <= 100) return colors.success;
    if (bpm <= 130) return colors.warning;
    return colors.danger;
  };

  const getHRZone = (bpm: number) => {
    if (bpm < 60) return 'Resting';
    if (bpm <= 100) return 'Normal';
    if (bpm <= 130) return 'Elevated';
    return 'High';
  };

  if (isConnected && lastHeartRate) {
    const { min, max } = getMinMaxHR();
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Live Heart Rate</Text>
          <Pressable onPress={disconnect} style={s.disconnectBtn}>
            <Text style={s.disconnectText}>Disconnect</Text>
          </Pressable>
        </View>

        <View style={s.deviceRow}>
          <Text style={s.deviceName}>{connectedDevice?.name}</Text>
          {batteryLevel !== null && (
            <View style={s.batteryRow}>
              <Icon name="battery" size={14} color={colors.textSecondary} />
              <Text style={s.batteryText}>{batteryLevel}%</Text>
            </View>
          )}
        </View>

        <View style={[s.hrCard, { borderLeftColor: getHRColor(lastHeartRate.bpm) }]}>
          <Text style={s.hrLabel}>BPM</Text>
          <Text style={[s.hrValue, { color: getHRColor(lastHeartRate.bpm) }]}>{lastHeartRate.bpm}</Text>
          <Text style={s.hrZone}>{getHRZone(lastHeartRate.bpm)}</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}><Text style={s.statLabel}>Avg</Text><Text style={s.statValue}>{getAverageHR()}</Text></View>
          <View style={s.statCard}><Text style={s.statLabel}>Min</Text><Text style={s.statValue}>{min}</Text></View>
          <View style={s.statCard}><Text style={s.statLabel}>Max</Text><Text style={s.statValue}>{max}</Text></View>
        </View>

        <View style={s.chartSection}>
          <Text style={s.chartTitle}>Recent ({heartRateHistory.length})</Text>
          <View style={s.miniChart}>
            {heartRateHistory.slice(-20).map((hr, i) => (
              <View
                key={i}
                style={[s.chartBar, { height: Math.max(4, ((hr.bpm - 40) / 160) * 60), backgroundColor: getHRColor(hr.bpm) }]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Connect Watch</Text>
      </View>

      {error && (
        <View style={s.errorCard}>
          <Icon name="alert-circle" size={14} color={colors.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <Text style={s.instructions}>
        Make sure your watch is disconnected from its companion app, then tap Scan.
      </Text>

      <Pressable style={[s.scanBtn, isScanning && { opacity: 0.6 }]} onPress={scan} disabled={isScanning}>
        {isScanning ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={s.scanBtnText}>Scan for watches</Text>
        )}
      </Pressable>

      {devices.length > 0 && (
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable style={s.deviceItem} onPress={() => handleConnect(item)} disabled={connecting === item.id}>
              <View>
                <Text style={s.deviceItemName}>{item.name}</Text>
                <Text style={s.deviceItemSignal}>Signal: {item.rssi} dBm</Text>
              </View>
              {connecting === item.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={s.connectText}>Connect</Text>
              )}
            </Pressable>
          )}
        />
      )}

      {!isScanning && devices.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyText}>No watches found</Text>
          <Text style={s.emptySub}>Tap Scan to search for nearby BLE devices.</Text>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  headerTitle: { ...typography.screenTitle, color: colors.text },
  disconnectBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.dangerMuted, borderRadius: radius.sm },
  disconnectText: { ...typography.meta, color: colors.danger, fontWeight: '500' },

  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  deviceName: { ...typography.cardTitle, color: colors.text },
  batteryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  batteryText: { ...typography.meta, color: colors.textSecondary },

  hrCard: {
    alignItems: 'center', padding: spacing['2xl'], backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3, marginBottom: spacing.lg,
  },
  hrLabel: { ...typography.meta, color: colors.textSecondary },
  hrValue: { fontSize: 56, fontWeight: '700' },
  hrZone: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.sm, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  statLabel: { ...typography.meta, color: colors.textTertiary },
  statValue: { fontSize: 20, fontWeight: '600', color: colors.text, marginTop: 2 },

  chartSection: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  chartTitle: { ...typography.meta, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 2 },
  chartBar: { flex: 1, borderRadius: 2, minWidth: 3 },

  instructions: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  scanBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.sm, alignItems: 'center', marginBottom: spacing.lg },
  scanBtnText: { ...typography.cardTitle, color: '#FFF' },

  deviceItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.sm,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  deviceItemName: { ...typography.cardTitle, color: colors.text },
  deviceItemSignal: { ...typography.meta, color: colors.textTertiary, marginTop: 2 },
  connectText: { ...typography.caption, color: colors.primary, fontWeight: '500' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.cardTitle, color: colors.textSecondary },
  emptySub: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs },

  errorCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerMuted, padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.md },
  errorText: { ...typography.caption, color: colors.danger },
});
