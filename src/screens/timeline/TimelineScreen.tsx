import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, StatusBar, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_BASE = 'https://askfirst.co/api/ai';
const { width } = Dimensions.get('window');

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Cookie: `session_token=${token}` } : {}) };

      const [threadsRes, sessionsRes] = await Promise.all([
        fetch(`${AI_BASE}/threads?user_id=5918`, { headers }),
        fetch(`${AI_BASE}/sessions?user_id=5918`, { headers }),
      ]);

      const threadsData = await threadsRes.json();
      const sessionsData = await sessionsRes.json();
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

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // Stats
  const totalChats = threads.length;
  const totalAssessments = threads.filter(t => t.isAssessment).length;
  const thisMonth = threads.filter(t => new Date(t.created_at).getMonth() === new Date().getMonth()).length;

  // Activity calendar - which days had activity
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

  // Group threads by date
  const grouped = threads.reduce((acc, t) => {
    const key = formatGroupDate(t.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, ThreadData[]>);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={{ height: StatusBar.currentHeight || 0, backgroundColor: '#F8FAFC' }} />

      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7FF9" />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Health Journey</Text>
            <Text style={s.subtitle}>Track your wellness over time</Text>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statNumber}>{totalChats}</Text>
              <Text style={s.statLabel}>Conversations</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[s.statNumber, { color: '#16A34A' }]}>{totalAssessments}</Text>
              <Text style={s.statLabel}>Assessments</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#FFF7ED' }]}>
              <Text style={[s.statNumber, { color: '#F59E0B' }]}>{thisMonth}</Text>
              <Text style={s.statLabel}>This Month</Text>
            </View>
          </View>

          {/* Activity Heatmap */}
          <View style={s.heatmapCard}>
            <View style={s.heatmapHeader}>
              <Text style={s.heatmapTitle}>Activity</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.monthTabs}>
                  {monthNames.map((m, i) => (
                    <Pressable
                      key={m}
                      style={[s.monthTab, selectedMonth === i && s.monthTabActive]}
                      onPress={() => setSelectedMonth(i)}
                    >
                      <Text style={[s.monthTabText, selectedMonth === i && s.monthTabTextActive]}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={s.heatmapGrid}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <View
                  key={day}
                  style={[
                    s.heatmapDot,
                    activityDays.has(day) && s.heatmapDotActive,
                    day === new Date().getDate() && selectedMonth === new Date().getMonth() && s.heatmapDotToday,
                  ]}
                >
                  <Text style={[s.heatmapDayText, activityDays.has(day) && { color: '#FFF' }]}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={s.heatmapLegend}>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#E5E7EB' }]} /><Text style={s.legendText}>No activity</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#2D7FF9' }]} /><Text style={s.legendText}>Active day</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#111827', borderWidth: 2, borderColor: '#2D7FF9' }]} /><Text style={s.legendText}>Today</Text></View>
            </View>
          </View>

          {/* Health Streak */}
          <View style={s.streakCard}>
            <View style={s.streakLeft}>
              <Text style={s.streakEmoji}>🔥</Text>
              <View>
                <Text style={s.streakTitle}>{activityDays.size} Active Days</Text>
                <Text style={s.streakSub}>in {monthNames[selectedMonth]} 2026</Text>
              </View>
            </View>
            <View style={s.streakProgress}>
              <View style={[s.streakBar, { width: `${(activityDays.size / daysInMonth) * 100}%` }]} />
            </View>
          </View>

          {/* Timeline */}
          <Text style={s.sectionTitle}>Conversations</Text>

          {Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={s.group}>
              <Text style={s.groupDate}>{date}</Text>
              {items.map((item, idx) => (
                <Pressable
                  key={item.id}
                  style={s.timelineItem}
                  onPress={() => navigation.navigate('ChatThread', { threadId: item.id })}
                >
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, { backgroundColor: item.isAssessment ? '#2D7FF9' : '#16A34A' }]} />
                    {idx < items.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={s.timelineCard}>
                    <View style={s.timelineCardHeader}>
                      <View style={[s.timelineIcon, { backgroundColor: item.isAssessment ? '#EAF4FF' : '#F0FDF4' }]}>
                        <Text style={{ fontSize: 16 }}>{item.isAssessment ? '🩺' : '💬'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.timelineTitle}>{item.isAssessment ? 'Health Assessment' : 'Health Chat'}</Text>
                        <Text style={s.timelineTime}>{new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      <Text style={s.chevron}>›</Text>
                    </View>
                    <Text style={s.timelinePreview} numberOfLines={2}>{item.user_message}</Text>
                    {item.assistant_message && (
                      <View style={s.aiReply}>
                        <Text style={s.aiReplyLabel}>Clary:</Text>
                        <Text style={s.aiReplyText} numberOfLines={1}>{item.assistant_message}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          {threads.length === 0 && !loading && (
            <View style={s.empty}>
              <View style={s.emptyCircle}><Text style={{ fontSize: 36 }}>🌱</Text></View>
              <Text style={s.emptyTitle}>Start Your Journey</Text>
              <Text style={s.emptyDesc}>Chat with Clary about your health to build your timeline.</Text>
              <Pressable style={s.emptyBtn} onPress={() => navigation.navigate('ChatTab')}>
                <Text style={s.emptyBtnText}>Start Conversation</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
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
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#EAF4FF', borderRadius: 18, padding: 14, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#2D7FF9' },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginTop: 4 },

  // Heatmap
  heatmapCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  heatmapHeader: { marginBottom: 14 },
  heatmapTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  monthTabs: { flexDirection: 'row', gap: 4 },
  monthTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  monthTabActive: { backgroundColor: '#2D7FF9' },
  monthTabText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  monthTabTextActive: { color: '#FFF', fontWeight: '600' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatmapDot: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  heatmapDotActive: { backgroundColor: '#2D7FF9' },
  heatmapDotToday: { borderWidth: 2, borderColor: '#2D7FF9', backgroundColor: '#111827' },
  heatmapDayText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  heatmapLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: '#9CA3AF' },

  // Streak
  streakCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  streakEmoji: { fontSize: 24 },
  streakTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  streakSub: { fontSize: 12, color: '#6B7280' },
  streakProgress: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3 },
  streakBar: { height: 6, backgroundColor: '#F59E0B', borderRadius: 3 },

  // Section
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 14 },

  // Groups
  group: { paddingHorizontal: 20, marginBottom: 20 },
  groupDate: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },

  // Timeline Item
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 24, paddingTop: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4 },
  timelineCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 14, marginLeft: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  timelineCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  timelineIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  timelineTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  timelineTime: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  chevron: { fontSize: 20, color: '#D1D5DB' },
  timelinePreview: { fontSize: 14, color: '#374151', lineHeight: 20 },
  aiReply: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 8, gap: 4 },
  aiReplyLabel: { fontSize: 12, fontWeight: '600', color: '#2D7FF9' },
  aiReplyText: { fontSize: 12, color: '#6B7280', flex: 1 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: { backgroundColor: '#2D7FF9', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
