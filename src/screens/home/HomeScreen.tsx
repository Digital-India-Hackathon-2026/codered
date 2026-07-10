import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Image, StatusBar, Pressable,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { communityAPI } from '../../api/services';
import { healthConnect, HealthData } from '../../services/healthConnect';
import { Icon, AnimatedPressable } from '../../components/shared';
import { colors, spacing, radius, typography } from '../../theme';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  author: { username: string; image_src: string };
  community_page: { title: string; logo_url?: string };
  views: number;
  total_replies: number;
  total_reactions: number;
}

interface Thread {
  id: number;
  user_message: string;
  assistant_message: string;
  created_at: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [forYouPosts, setForYouPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [recentChats, setRecentChats] = useState<Thread[]>([]);
  const [vitals, setVitals] = useState<HealthData | null>(null);
  const [watchConnected, setWatchConnected] = useState(false);

  const userInterests = user?.interests || ['Weight loss', 'Gut health', 'Mental health'];

  const loadData = useCallback(async () => {
    try {
      const [topRes, feedRes, threadsRes] = await Promise.allSettled([
        communityAPI.getTopPosts({ limit: 5 }),
        communityAPI.getPosts({ limit: 8 }),
        communityAPI.getThreads(5918),
      ]);
      if (topRes.status === 'fulfilled') setTrendingPosts(topRes.value.data?.posts || []);
      if (feedRes.status === 'fulfilled') {
        const posts = feedRes.value.data?.posts || [];
        const matched = posts.filter((p: Post) =>
          userInterests.some((i: string) => p.category.toLowerCase().includes(i.toLowerCase()))
        );
        setForYouPosts(matched.length > 0 ? matched : posts.slice(0, 4));
      }
      if (threadsRes.status === 'fulfilled') setRecentChats((threadsRes.value.data?.threads || []).slice(0, 3));
    } catch {}
    try {
      const avail = await healthConnect.checkAvailability();
      if (avail === 'available') {
        const inited = await healthConnect.init();
        if (inited) { setVitals(await healthConnect.getHealthData()); setWatchConnected(true); }
      }
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  const timeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textTertiary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting()}</Text>
            <Text style={s.userName}>{user?.username || 'there'}</Text>
          </View>
          <Pressable style={s.avatar} onPress={() => navigation.navigate('ProfileTab')}>
            {user?.image_src ? (
              <Image source={{ uri: user.image_src }} style={s.avatarImg} />
            ) : (
              <Text style={s.avatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </Pressable>
        </View>

        {/* Ask Clary */}
        <Pressable style={s.claryCard} onPress={() => navigation.navigate('ChatTab')}>
          <View style={s.claryLeft}>
            <Text style={s.claryTitle}>Ask Clary</Text>
            <Text style={s.clarySub}>Describe symptoms, get guidance</Text>
          </View>
          <Icon name="arrow-right" size={18} color={colors.surface} />
        </Pressable>

        {/* Vitals Strip */}
        {watchConnected && vitals && (
          <Pressable style={s.vitalsCard} onPress={() => navigation.navigate('VitalsTab')}>
            <View style={s.vitalsHeader}>
              <Icon name="activity" size={14} color={colors.textSecondary} />
              <Text style={s.vitalsLabel}>Live vitals</Text>
            </View>
            <View style={s.vitalsRow}>
              {vitals.heartRate && (
                <View style={s.vitalItem}>
                  <Text style={s.vitalValue}>{vitals.heartRate.bpm}</Text>
                  <Text style={s.vitalUnit}>bpm</Text>
                </View>
              )}
              <View style={s.vitalItem}>
                <Text style={s.vitalValue}>{vitals.steps.toLocaleString()}</Text>
                <Text style={s.vitalUnit}>steps</Text>
              </View>
              {vitals.sleep && (
                <View style={s.vitalItem}>
                  <Text style={s.vitalValue}>{vitals.sleep.hours}h{vitals.sleep.minutes}m</Text>
                  <Text style={s.vitalUnit}>sleep</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}

        {/* Quick Actions */}
        <View style={s.actionsRow}>
          {[
            { icon: 'upload', label: 'Upload', onPress: () => navigation.navigate('UploadReport') },
            { icon: 'heart', label: 'Vitals', onPress: () => navigation.navigate('VitalsTab') },
            { icon: 'clock', label: 'History', onPress: () => navigation.navigate('ChatHistory') },
            { icon: 'package', label: 'Meds', onPress: () => navigation.navigate('MedicationsTab') },
          ].map(a => (
            <Pressable key={a.label} style={s.actionItem} onPress={a.onPress}>
              <View style={s.actionIcon}>
                <Icon name={a.icon} size={18} color={colors.textSecondary} />
              </View>
              <Text style={s.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Conversations */}
        {recentChats.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recent conversations</Text>
              <Pressable onPress={() => navigation.navigate('ChatHistory')}>
                <Text style={s.seeAll}>See all</Text>
              </Pressable>
            </View>
            {recentChats.map(chat => (
              <Pressable
                key={chat.id}
                style={s.chatItem}
                onPress={() => navigation.navigate('ChatThread', { threadId: chat.id })}
              >
                <View style={s.chatIcon}>
                  <Icon name="message-circle" size={14} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.chatMsg} numberOfLines={1}>{chat.user_message}</Text>
                  <Text style={s.chatTime}>{timeAgo(chat.created_at)}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* For You Posts */}
        {forYouPosts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>For you</Text>
            {forYouPosts.slice(0, 3).map(post => (
              <View key={post.id} style={s.postCard}>
                <View style={s.postMeta}>
                  <Text style={s.postCategory}>{post.category}</Text>
                  <Text style={s.postDot}>·</Text>
                  <Text style={s.postAuthor}>{post.author.username}</Text>
                </View>
                <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={s.postDesc} numberOfLines={2}>{post.description}</Text>
                <View style={s.postStats}>
                  <Text style={s.postStat}>{formatNum(post.views)} views</Text>
                  <Text style={s.postStat}>{formatNum(post.total_replies)} replies</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Trending */}
        {trendingPosts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Trending</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
              {trendingPosts.map(post => (
                <View key={post.id} style={s.trendCard}>
                  <Text style={s.trendCategory}>{post.category}</Text>
                  <Text style={s.trendTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={s.trendStat}>{formatNum(post.total_replies)} replies</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing['3xl'], paddingBottom: 100 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { ...typography.caption, color: colors.textSecondary },
  userName: { ...typography.screenTitle, color: colors.text, marginTop: 2 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarText: { ...typography.cardTitle, color: colors.textSecondary },

  // Clary CTA
  claryCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  claryLeft: {},
  claryTitle: { ...typography.cardTitle, color: '#FFFFFF', fontWeight: '600' },
  clarySub: { ...typography.meta, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Vitals
  vitalsCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  vitalsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  vitalsLabel: { ...typography.meta, color: colors.textSecondary },
  vitalsRow: { flexDirection: 'row', gap: spacing['2xl'] },
  vitalItem: { alignItems: 'flex-start' },
  vitalValue: { fontSize: 20, fontWeight: '600', color: colors.text },
  vitalUnit: { ...typography.meta, color: colors.textTertiary },

  // Actions
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing['2xl'] },
  actionItem: { alignItems: 'center', gap: spacing.sm },
  actionIcon: {
    width: 44, height: 44, borderRadius: radius.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { ...typography.meta, color: colors.textSecondary },

  // Section
  section: { marginBottom: spacing['2xl'] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.sectionTitle, color: colors.text, marginBottom: spacing.md },
  seeAll: { ...typography.caption, color: colors.primary },

  // Chat items
  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  chatIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center' },
  chatMsg: { ...typography.body, color: colors.text },
  chatTime: { ...typography.meta, color: colors.textTertiary, marginTop: 2 },

  // Posts
  postCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  postCategory: { ...typography.meta, color: colors.primary, fontWeight: '500' },
  postDot: { ...typography.meta, color: colors.textTertiary },
  postAuthor: { ...typography.meta, color: colors.textTertiary },
  postTitle: { ...typography.cardTitle, color: colors.text, marginBottom: spacing.xs },
  postDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  postStats: { flexDirection: 'row', gap: spacing.lg },
  postStat: { ...typography.meta, color: colors.textTertiary },

  // Trending
  hScroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  trendCard: {
    width: 200, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.lg, marginRight: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  trendCategory: { ...typography.meta, color: colors.primary, fontWeight: '500', marginBottom: spacing.sm },
  trendTitle: { ...typography.cardTitle, color: colors.text, marginBottom: spacing.sm },
  trendStat: { ...typography.meta, color: colors.textTertiary },
});
