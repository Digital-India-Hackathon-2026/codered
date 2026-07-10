import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState, Button } from '../../components/UI';
import { medicationsAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius } from '../../theme';

export const MedicationsScreen = ({ navigation }: any) => {
  const [medications, setMedications] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeds = async () => {
    try {
      const { data } = tab === 'active' ? await medicationsAPI.getActive() : await medicationsAPI.getHistory();
      setMedications(data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); loadMeds(); }, [tab]);
  const onRefresh = async () => { setRefreshing(true); await loadMeds(); setRefreshing(false); };

  const markTaken = async (id: string) => {
    try {
      await medicationsAPI.markTaken(id);
      loadMeds();
    } catch { Alert.alert('Error', 'Could not mark as taken'); }
  };

  const renderMed = ({ item }: { item: any }) => (
    <Card style={styles.medCard}>
      <View style={styles.medHeader}>
        <View style={[styles.medIcon, { backgroundColor: getMedColor(item.type) + '20' }]}>
          <Text style={{ fontSize: 20 }}>{getMedEmoji(item.type)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medDose}>{item.dosage} • {item.frequency}</Text>
        </View>
        {tab === 'active' && (
          <Badge text={item.taken_today ? '✓ Taken' : 'Due'} color={item.taken_today ? colors.secondary : colors.accent} />
        )}
      </View>

      {item.timing && (
        <View style={styles.timingRow}>
          <Text style={styles.timingLabel}>⏰ {item.timing}</Text>
          {item.with_food && <Text style={styles.timingLabel}>🍽 With food</Text>}
        </View>
      )}

      {tab === 'active' && !item.taken_today && (
        <TouchableOpacity style={styles.takenBtn} onPress={() => markTaken(item.id)}>
          <Text style={styles.takenBtnText}>✓ Mark as Taken</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Medications</Text>
        <Button title="+ Add" onPress={() => navigation.navigate('AddMedication')} style={styles.addBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMed}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <EmptyState icon="💊" title="No medications" subtitle={tab === 'active' ? 'Add your current medications' : 'Past medications will appear here'} /> : null
        }
      />
    </View>
  );
};

const getMedEmoji = (type: string) => {
  const map: Record<string, string> = { tablet: '💊', capsule: '💊', syrup: '🧴', injection: '💉', inhaler: '🫁', drops: '💧' };
  return map[type] || '💊';
};
const getMedColor = (type: string) => {
  const map: Record<string, string> = { tablet: colors.primary, capsule: '#AF52DE', syrup: colors.accent, injection: colors.danger };
  return map[type] || colors.primary;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  screenTitle: { ...typography.h1, color: colors.text },
  addBtn: { height: 40, paddingHorizontal: spacing.lg },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodyBold, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  list: { padding: spacing.lg, paddingBottom: 100 },
  medCard: { marginBottom: spacing.md },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  medIcon: { width: 40, height: 40, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  medName: { ...typography.bodyBold, color: colors.text },
  medDose: { ...typography.caption, color: colors.textSecondary },
  timingRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  timingLabel: { ...typography.caption, color: colors.textSecondary },
  takenBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.secondary + '15', borderRadius: borderRadius.sm, alignItems: 'center' },
  takenBtnText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
});
