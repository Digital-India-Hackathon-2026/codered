import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl,
  Image, StatusBar, Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { communityAPI } from '../../api/services';
import { healthConnect, HealthData } from '../../services/healthConnect';

const { width } = Dimensions.get('window');

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
  const [topics, setTopics] = useState<string[]>([]);
  const [vitals, setVitals] = useState<HealthData | null>(null);
  const [watchConnected, setWatchConnected] = useState(false);

  const userInterests = user?.interests || ['Weight loss', 'Gut health', 'Mental health'];

  const loadData = useCallback(async () => {
    try {
      const [topRes, feedRes, threadsRes, topicsRes] = await Promise.allSettled([
        communityAPI.getTopPosts({ limit: 5 }),
        communityAPI.getPosts({ limit: 8 }),
        communityAPI.getThreads(5918),
        communityAPI.getTopics(),
      ]);

      if (topRes.status === 'fulfilled') setTrendingPosts(topRes.value.data?.posts || []);
      if (feedRes.status === 'fulfilled') {
        const posts = feedRes.value.data?.posts || [];
        const matched = posts.filter((p: Post) =>
          userInterests.some((i: string) => p.category.toLowerCase().includes(i.toLowerCase()))
        );
        setForYouPosts(matched.length > 0 ? matched : posts.slice(0, 4));
      }
      if (threadsRes.status === 'fulfilled') {
        setRecentChats((threadsRes.value.data?.threads || []).slice(0, 3));
      }
      if (topicsRes.status === 'fulfilled') setTopics(topicsRes.value.data || []);
    } catch {}

    // Load watch data
    try {
      const avail = await healthConnect.checkAvailability();
      if (avail === 'available') {
        const inited = await healthConnect.init();
        if (inited) {
          const data = await healthConnect.getHealthData();
          setVitals(data);
          setWatchConnected(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', icon: '☀️' };
    if (h < 17) return { text: 'Good Afternoon', icon: '🌤️' };
    return { text: 'Good Evening', icon: '🌙' };
  };

  const g = greeting();
  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
  const timeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const categoryEmoji: Record<string, string> = {
    'Weight Loss': '🏋️', 'Gut Health': '🫃', 'Mental Health': '🧠',
    'Hair Care': '💇', 'Skin Care': '✨', 'Heart Health': '❤️',
    'Sexual Health': '🔒', 'Pregnancy': '🤰', 'Parenting': '👶',
    'Fertility': '🌱', "Women's Health": '♀️', 'Bones & Muscles': '💪',
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={{ height: StatusBar.currentHeight || 0, backgroundColor: '#F8FAFC' }} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D7FF9" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greetingText}>{g.text} {g.icon}</Text>
            <Text style={s.userName}>{user?.username || 'there'}</Text>
          </View>
          <Pressable style={s.profileBtn} onPress={() => navigation.navigate('ProfileTab')}>
            {user?.image_src ? (
              <Image source={{ uri: user.image_src }} style={s.profileImg} />
            ) : (
              <Text style={s.profileInitial}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
            )}
          </Pressable>
        </View>

        {/* Watch Vitals Strip */}
        {watchConnected && vitals && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Pressable style={s.vitalsStrip} onPress={() => navigation.navigate('VitalsTab')}>
              <View style={s.vitalsHeader}>
                <Text style={s.vitalsTitle}>⌚ Live from Watch</Text>
                <View style={s.vitalsDot} />
              </View>
              <View style={s.vitalsRow}>
                {vitals.heartRate && (
                  <View style={s.vitalMini}>
                    <Text style={s.vitalMiniIcon}>❤️</Text>
                    <Text style={s.vitalMiniValue}>{vitals.heartRate.bpm}</Text>
                    <Text style={s.vitalMiniUnit}>bpm</Text>
                  </View>
                )}
                <View style={s.vitalMini}>
                  <Text style={s.vitalMiniIcon}>🚶</Text>
                  <Text style={s.vitalMiniValue}>{vitals.steps.toLocaleString()}</Text>
                  <Text style={s.vitalMiniUnit}>steps</Text>
                </View>
                {vitals.sleep && (
                  <View style={s.vitalMini}>
                    <Text style={s.vitalMiniIcon}>😴</Text>
                    <Text style={s.vitalMiniValue}>{vitals.sleep.hours}h{vitals.sleep.minutes}m</Text>
                    <Text style={s.vitalMiniUnit}>sleep</Text>
                  </View>
                )}
                {vitals.spo2 && (
                  <View style={s.vitalMini}>
                    <Text style={s.vitalMiniIcon}>🫁</Text>
                    <Text style={s.vitalMiniValue}>{vitals.spo2}%</Text>
                    <Text style={s.vitalMiniUnit}>SpO2</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* AI Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable style={s.aiCard} onPress={() => navigation.navigate('ChatTab')}>
            <View style={s.aiCardInner}>
              <View style={s.aiAvatar}><Text style={s.aiAvatarText}>🤖</Text></View>
              <View style={s.aiContent}>
                <Text style={s.aiTitle}>Talk to Clary</Text>
                <Text style={s.aiSubtitle}>Describe symptoms, upload reports, get instant health guidance</Text>
              </View>
              <View style={s.aiArrow}><Text style={s.aiArrowText}>→</Text></View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Recent Clary Conversations */}
        {recentChats.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Recent with Clary</Text>
              <Pressable onPress={() => navigation.navigate('ChatHistory')}>
                <Text style={s.seeAll}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
              {recentChats.map(chat => (
                <Pressable
                  key={chat.id}
                  style={s.chatCard}
                  onPress={() => navigation.navigate('ChatThread', { threadId: chat.id })}
                >
                  <Text style={s.chatMsg} numberOfLines={2}>{chat.user_message}</Text>
                  <Text style={s.chatReply} numberOfLines={2}>{chat.assistant_message}</Text>
                  <Text style={s.chatTime}>{timeAgo(chat.created_at)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* For You - Personalized Posts */}
        {forYouPosts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>For You 💡</Text>
            </View>
            {forYouPosts.slice(0, 3).map((post, i) => (
              <Animated.View key={post.id} entering={FadeInRight.delay(i * 100).duration(300)}>
                <View style={s.postCard}>
                  <View style={s.postHeader}>
                    <Image source={{ uri: post.author.image_src }} style={s.postAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.postAuthor}>{post.author.username}</Text>
                      <View style={s.postCategoryBadge}>
                        <Text style={s.postCategoryText}>
                          {categoryEmoji[post.category] || '📌'} {post.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={s.postDesc} numberOfLines={3}>{post.description}</Text>
                  <View style={s.postStats}>
                    <Text style={s.postStat}>👁 {formatNum(post.views)}</Text>
                    <Text style={s.postStat}>💬 {formatNum(post.total_replies)}</Text>
                    <Text style={s.postStat}>❤️ {formatNum(post.total_reactions)}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Trending Discussions */}
        {trendingPosts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={s.sectionTitle}>🔥 Trending Discussions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
              {trendingPosts.map(post => (
                <View key={post.id} style={s.trendCard}>
                  <View style={s.trendBadge}>
                    <Text style={s.trendBadgeText}>
                      {categoryEmoji[post.category] || '📌'} {post.category}
                    </Text>
                  </View>
                  <Text style={s.trendTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={s.trendDesc} numberOfLines={2}>{post.description}</Text>
                  <View style={s.trendStats}>
                    <Text style={s.trendStat}>{formatNum(post.total_replies)} replies</Text>
                    <Text style={s.trendDot}>•</Text>
                    <Text style={s.trendStat}>{formatNum(post.views)} views</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Health Topics */}
        {topics.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Text style={s.sectionTitle}>Explore Topics</Text>
            <View style={s.topicsGrid}>
              {topics.slice(0, 8).map(topic => (
                <Pressable key={topic} style={s.topicChip}>
                  <Text style={s.topicEmoji}>{categoryEmoji[topic] || '📌'}</Text>
                  <Text style={s.topicText}>{topic}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.quickGrid}>
            {[
              { icon: '📋', title: 'Upload Report', sub: 'AI analysis', screen: 'ReportsTab' },
              { icon: '📅', title: 'Timeline', sub: 'Health journey', screen: 'TimelineTab' },
              { icon: '🗂️', title: 'Chat History', sub: 'Past conversations', screen: 'ChatHistory' },
              { icon: '👤', title: 'Profile', sub: 'Your health data', screen: 'ProfileTab' },
            ].map(item => (
              <Pressable key={item.title} style={s.quickItem} onPress={() => navigation.navigate(item.screen)}>
                <Text style={s.quickIcon}>{item.icon}</Text>
                <Text style={s.quickTitle}>{item.title}</Text>
                <Text style={s.quickSub}>{item.sub}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 14, color: '#6B7280' },
  userName: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2D7FF9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileImg: { width: 44, height: 44, borderRadius: 22 },
  profileInitial: { fontSize: 18, fontWeight: '700', color: '#FFF' },

  // Watch Vitals Strip
  vitalsStrip: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#EF444420', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  vitalsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  vitalsTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  vitalsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  vitalMini: { alignItems: 'center', gap: 2 },
  vitalMiniIcon: { fontSize: 18 },
  vitalMiniValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  vitalMiniUnit: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },

  // AI Card
  aiCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 18, marginBottom: 24, borderWidth: 1.5, borderColor: '#2D7FF920', shadowColor: '#2D7FF9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  aiCardInner: { flexDirection: 'row', alignItems: 'center' },
  aiAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiAvatarText: { fontSize: 24 },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  aiSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 3, lineHeight: 18 },
  aiArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2D7FF9', justifyContent: 'center', alignItems: 'center' },
  aiArrowText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // Section
  sectionTitle: { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 14, color: '#2D7FF9', fontWeight: '600' },
  hScroll: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 24 },

  // Recent Chats
  chatCard: { width: 220, backgroundColor: '#FFF', borderRadius: 18, padding: 14, marginRight: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  chatMsg: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  chatReply: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
  chatTime: { fontSize: 11, color: '#9CA3AF' },

  // Posts
  postCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: 18 },
  postAuthor: { fontSize: 13, fontWeight: '600', color: '#374151' },
  postCategoryBadge: { backgroundColor: '#F0F7FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
  postCategoryText: { fontSize: 11, color: '#2D7FF9', fontWeight: '600' },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 22 },
  postDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },
  postStats: { flexDirection: 'row', gap: 16 },
  postStat: { fontSize: 12, color: '#9CA3AF' },

  // Trending
  trendCard: { width: 240, backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginRight: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  trendBadge: { backgroundColor: '#FFF7ED', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  trendBadgeText: { fontSize: 11, fontWeight: '600', color: '#EA580C' },
  trendTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 20 },
  trendDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 10 },
  trendStats: { flexDirection: 'row', alignItems: 'center' },
  trendStat: { fontSize: 12, color: '#9CA3AF' },
  trendDot: { fontSize: 12, color: '#D1D5DB', marginHorizontal: 6 },

  // Topics
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  topicChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderWidth: 1, borderColor: '#F0F0F0' },
  topicEmoji: { fontSize: 16 },
  topicText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Quick Actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickItem: { width: (width - 52) / 2, backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  quickSub: { fontSize: 12, color: '#9CA3AF' },
});
