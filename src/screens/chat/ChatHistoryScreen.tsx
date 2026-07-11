import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';

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
        headers: { 'Content-Type': 'application/json', ...(token ? { Cookie: `session_token=${token}` } : {}) },
      });
      const data: any = await res.json();
      setThreads((data.threads || []).filter((t: Thread) => t.user_message));
    } catch {} finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderThread = ({ item, index }: { item: Thread; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(200).damping(18)}>
      <Pressable
        style={s.card}
        onPress={() => navigation.navigate('ChatThread', { threadId: item.id })}
      >
        <View style={s.iconWrap}>
          <Icon name="ChatCircle" size={18} color={colors.coral} weight="fill" />
        </View>
        <View style={s.cardBody}>
          <Text style={s.userMsg} numberOfLines={2}>{item.user_message}</Text>
          {item.assistant_message && (
            <Text style={s.assistantMsg} numberOfLines={1}>{item.assistant_message}</Text>
          )}
        </View>
        <View style={s.cardRight}>
          <Text style={s.date}>{formatDate(item.created_at)}</Text>
          <Icon name="CaretRight" size={14} color={colors.textTertiary} weight="regular" />
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="ArrowLeft" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Chat History</Text>
        <View style={{ width: 22 }} />
      </View>

      {threads.length === 0 && !loading ? (
        <View style={s.empty}>
          <Icon name="ChatCircleDots" size={40} color={colors.textTertiary} weight="regular" />
          <Text style={s.emptyTitle}>No conversations yet</Text>
          <Text style={s.emptyDesc}>Start chatting with Vita to see your history here</Text>
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
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  list: { padding: 16, gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coralSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  userMsg: { fontFamily: fonts.generalSans.medium, fontSize: 14, color: colors.text, lineHeight: 19 },
  assistantMsg: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary, marginTop: 3 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  date: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  emptyDesc: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary, textAlign: 'center' },
});
