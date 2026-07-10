import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../../components/shared';
import { colors, spacing, radius, typography } from '../../theme';

const AI_BASE = 'https://askfirst.co/api/ai';

interface ThreadData {
  id: number;
  user_message: string | null;
  assistant_message: string | null;
  created_at: string;
  isAssessment: boolean;
}

export const TimelineScreen = ({ navigation }: any) => {
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Cookie: `session_token=${token}` } : {}) };

      const [threadsRes, sessionsRes] = await Promise.all([
        fetch(`${AI_BASE}/threads?user_id=5918`, { headers }),
        fetch(`${AI_BASE}/sessions?user_id=5918`, { headers }),
      ]);

      const threadsData: any = await threadsRes.json();
      const sessionsData: any = await sessionsRes.json();
      const sessionThreadIds = new Set((sessionsData || []).map((s: any) => s.thread_id));

      const data: ThreadData[] = (threadsData.threads || [])
        .filter((t: any) => t.user_message)
        .map((t: any) => ({
          id: t.id,
          user_message: t.user_message,
          assistant_message: t.assistant_message,
          created_at: t.created_at,
          isAssessment: sessionThreadIds.has(t.id),
        }));

      setThreads(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const totalChats = threads.length;
  const totalAssessments = threads.filter(t => t.isAssessment).length;
  const thisMonth = threads.filter(t => new Date(t.created_at).getMonth() === new Date().getMonth()).length;

  const getActivityDays = () => {
    const days = new Set<number>();
    threads.forEach(t => {
      const d = new Date(t.created_at);
      if (d.getMonth() === selectedMonth) days.add(d.getDate());
    });
    return days;
  };

  const activityDays = getActivityDays();
  const daysInMonth = new Date(2026, selectedMonth + 1, 0).getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const grouped = threads.reduce((acc, t) => {
    const key = formatGroupDate(t.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, ThreadData[]>);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Timeline</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{totalChats}</Text>
            <Text style={s.statLabel}>Conversations</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{totalAssessments}</Text>
            <Text style={s.statLabel}>Assessments</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{thisMonth}</Text>
            <Text style={s.statLabel}>This month</Text>
          </View>
        </View>

        {/* Activity Calendar */}
        <View style={s.calCard}>
          <Text style={s.calTitle}>Activity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={s.monthRow}>
              {monthNames.map((m, i) => (
                <Pressable
                  key={m}
                  style={[s.monthChip, selectedMonth === i && s.monthChipActive]}
                  onPress={() => setSelectedMonth(i)}
                >
                  <Text style={[s.monthText, selectedMonth === i && s.monthTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={s.calGrid}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <View
                key={day}
                style={[
                  s.calDay,
                  activityDays.has(day) && s.calDayActive,
                  day === new Date().getDate() && selectedMonth === new Date().getMonth() && s.calDayToday,
                ]}
              >
                <Text style={[s.calDayText, activityDays.has(day) && { color: '#FFF' }]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conversations */}
        <View style={s.listSection}>
          <Text style={s.sectionTitle}>Conversations</Text>
          {Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={s.group}>
              <Text style={s.groupDate}>{date}</Text>
              {items.map(item => (
                <Pressable
                  key={item.id}
                  style={s.threadItem}
                  onPress={() => navigation.navigate('ChatThread', { threadId: item.id })}
                >
                  <View style={[s.threadDot, { backgroundColor: item.isAssessment ? colors.primary : colors.textTertiary }]} />
                  <View style={{ flex: 1 }}>
                    <View style={s.threadHeader}>
                      <Text style={s.threadType}>{item.isAssessment ? 'Assessment' : 'Chat'}</Text>
                      <Text style={s.threadTime}>
                        {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={s.threadMsg} numberOfLines={2}>{item.user_message}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          ))}

          {threads.length === 0 && !loading && (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptyDesc}>Chat with Clary to build your timeline.</Text>
              <Pressable style={s.emptyBtn} onPress={() => navigation.navigate('ChatTab')}>
                <Text style={s.emptyBtnText}>Start conversation</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const formatGroupDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing.lg },
  title: { ...typography.screenTitle, color: colors.text },

  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  statNumber: { fontSize: 20, fontWeight: '600', color: colors.text },
  statLabel: { ...typography.meta, color: colors.textTertiary, marginTop: 2 },

  calCard: {
    marginHorizontal: spacing.lg, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  calTitle: { ...typography.cardTitle, color: colors.text, fontWeight: '600', marginBottom: spacing.md },
  monthRow: { flexDirection: 'row', gap: spacing.xs },
  monthChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  monthChipActive: { backgroundColor: colors.primary },
  monthText: { ...typography.meta, color: colors.textSecondary },
  monthTextActive: { color: '#FFF', fontWeight: '500' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  calDay: {
    width: 30, height: 30, borderRadius: 6,
    backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center',
  },
  calDayActive: { backgroundColor: colors.primary },
  calDayToday: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.text },
  calDayText: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },

  listSection: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: spacing.md },
  group: { marginBottom: spacing.lg },
  groupDate: { ...typography.meta, color: colors.textTertiary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },

  threadItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  threadDot: { width: 8, height: 8, borderRadius: 4 },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadType: { ...typography.meta, color: colors.textSecondary, fontWeight: '500' },
  threadTime: { ...typography.meta, color: colors.textTertiary },
  threadMsg: { ...typography.body, color: colors.text, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyTitle: { ...typography.cardTitle, color: colors.text, marginBottom: spacing.xs },
  emptyDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  emptyBtnText: { ...typography.caption, color: '#FFF', fontWeight: '500' },
});
