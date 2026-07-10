import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${AI_BASE}/threads?user_id=5918`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `session_token=${token}` } : {}),
        },
      });
      const data = await res.json();
      const filtered = (data.threads || []).filter((t: Thread) => t.user_message);
      setThreads(filtered);
    } catch {} finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const renderThread = ({ item }: { item: Thread }) => (
    <Pressable
      style={styles.threadItem}
      onPress={() => navigation.navigate('ChatThread', { threadId: item.id })}
    >
      <View style={styles.threadIcon}>
        <Text style={styles.threadIconText}>💬</Text>
      </View>
      <View style={styles.threadContent}>
        <Text style={styles.threadMessage} numberOfLines={2}>
          {item.user_message}
        </Text>
        <Text style={styles.threadDate}>{formatDate(item.created_at)}</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2D7FF9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={{ width: 36 }} />
      </View>
      {threads.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: { fontSize: 32, color: '#111827', fontWeight: '300' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  list: { padding: 16 },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  threadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  threadIconText: { fontSize: 18 },
  threadContent: { flex: 1 },
  threadMessage: { fontSize: 15, color: '#111827', fontWeight: '500', lineHeight: 20 },
  threadDate: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  emptyText: { fontSize: 15, color: '#6B7280' },
});
