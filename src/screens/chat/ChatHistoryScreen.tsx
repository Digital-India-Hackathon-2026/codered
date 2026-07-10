import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../../components/shared';
import { colors, spacing, radius, typography } from '../../theme';

const AI_BASE = 'https://askfirst.co/api/ai';

interface Thread {
  id: number;
  user_message: string | null;
  assistant_message: string | null;
  created_at: string;
}

export const ChatHistoryScreen = ({ navigation }: any) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchThreads(); }, []);

  const fetchThreads = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${AI_BASE}/threads?user_id=5918`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `session_token=${token}` } : {}),
        },
      });
      const data: any = await res.json();
      setThreads((data.threads || []).filter((t: Thread) => t.user_message));
    } catch {} finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString();
  };

  const renderThread = ({ item }: { item: Thread }) => (
    <Pressable
      style={s.item}
      onPress={() => navigation.navigate('ChatThread', { threadId: item.id })}
    >
      <View style={s.itemIcon}>
        <Icon name="message-circle" size={16} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.itemMsg} numberOfLines={2}>{item.user_message}</Text>
        <Text style={s.itemDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textTertiary} />
    </Pressable>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>Chat History</Text>
        <View style={{ width: 20 }} />
      </View>
      {threads.length === 0 && !loading ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.cardTitle, color: colors.text, fontWeight: '600' },
  list: { padding: spacing.lg },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center',
  },
  itemMsg: { ...typography.body, color: colors.text },
  itemDate: { ...typography.meta, color: colors.textTertiary, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
