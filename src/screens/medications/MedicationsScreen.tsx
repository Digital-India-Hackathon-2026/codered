import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { Card, Badge, EmptyState, Button } from '../../components/UI';
import { Icon } from '../../components/shared';
import { medicationsAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

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
    try { await medicationsAPI.markTaken(id); loadMeds(); }
    catch { Alert.alert('Error', 'Could not mark as taken'); }
  };

  const renderMed = ({ item }: { item: any }) => (
    <Card style={s.medCard}>
      <View style={s.medHeader}>
        <View style={s.medIcon}>
          <Icon name="package" size={18} color={colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.medName}>{item.name}</Text>
          <Text style={s.medDose}>{item.dosage} · {item.frequency}</Text>
        </View>
        {tab === 'active' && (
          <Badge text={item.taken_today ? 'Taken' : 'Due'} color={item.taken_today ? colors.success : colors.warning} />
        )}
      </View>
      {item.timing && (
        <View style={s.timingRow}>
          <Icon name="clock" size={12} color={colors.textTertiary} />
          <Text style={s.timingText}>{item.timing}</Text>
          {item.with_food && <>
            <Icon name="coffee" size={12} color={colors.textTertiary} />
            <Text style={s.timingText}>With food</Text>
          </>}
        </View>
      )}
      {tab === 'active' && !item.taken_today && (
        <Pressable style={s.takenBtn} onPress={() => markTaken(item.id)}>
          <Icon name="check" size={14} color={colors.success} />
          <Text style={s.takenBtnText}>Mark as taken</Text>
        </Pressable>
      )}
    </Card>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Medications</Text>
        <Pressable style={s.addBtn} onPress={() => navigation.navigate('AddMedication')}>
          <Icon name="plus" size={16} color="#FFF" />
        </Pressable>
      </View>

      <View style={s.tabs}>
        <Pressable style={[s.tab, tab === 'active' && s.tabActive]} onPress={() => setTab('active')}>
          <Text style={[s.tabText, tab === 'active' && s.tabTextActive]}>Active</Text>
        </Pressable>
        <Pressable style={[s.tab, tab === 'history' && s.tabActive]} onPress={() => setTab('history')}>
          <Text style={[s.tabText, tab === 'history' && s.tabTextActive]}>History</Text>
        </Pressable>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMed}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
        ListEmptyComponent={!loading ? <EmptyState icon="" title="No medications" subtitle={tab === 'active' ? 'Add your current medications' : 'Past medications appear here'} /> : null}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing['2xl'] },
  screenTitle: { ...typography.screenTitle, color: colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: '#F4F4F5', borderRadius: radius.sm, padding: 3, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 6, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.text, fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: 100 },
  medCard: { marginBottom: spacing.sm },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  medIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center' },
  medName: { ...typography.cardTitle, color: colors.text, fontWeight: '500' },
  medDose: { ...typography.meta, color: colors.textSecondary, marginTop: 1 },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  timingText: { ...typography.meta, color: colors.textTertiary },
  takenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.successMuted, borderRadius: radius.sm },
  takenBtnText: { ...typography.meta, color: colors.success, fontWeight: '500' },
});
