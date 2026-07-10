import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

export const CommunityDetailScreen = ({ route, navigation }: any) => {
  const { community } = route.params;
  const [posts, setPosts] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    api.get(`/community_pages/${community.id}/posts`).then(res => {
      setPosts(res.data?.posts || []);
    }).catch(() => {});
  }, [community.id]);

  const handleJoin = async () => {
    setJoined(!joined);
    try { await api.post(`/community_pages/${community.id}/join`); } catch {}
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="ArrowLeft" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>Community</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <Image source={{ uri: community.logo_url }} style={s.logo} />
          <Text style={s.title}>{community.title}</Text>
          <Text style={s.meta}>{community.category} · {community.member_count || 0} members</Text>
          <Pressable onPress={handleJoin} style={[s.joinBtn, joined && s.joinedBtn]}>
            <Text style={[s.joinText, joined && s.joinedText]}>{joined ? 'Joined' : 'Join Community'}</Text>
          </Pressable>
        </View>

        <Text style={s.sectionTitle}>Posts</Text>
        {posts.length === 0 ? (
          <Text style={s.emptyText}>No posts in this community yet.</Text>
        ) : (
          posts.map(post => (
            <Pressable key={post.id} style={s.postCard} onPress={() => navigation.navigate('PostDetail', { post })}>
              <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text>
              {post.description ? <Text style={s.postDesc} numberOfLines={2}>{post.description}</Text> : null}
              <View style={s.postFooter}>
                <Text style={s.postMeta}>{post.author?.username}</Text>
                <View style={s.stat}>
                  <Icon name="Heart" size={12} color={colors.textTertiary} weight="regular" />
                  <Text style={s.postMeta}>{post.likes_count || 0}</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  heroCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  logo: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.surfaceSunken, marginBottom: 12 },
  title: { fontFamily: fonts.generalSans.semiBold, fontSize: 18, color: colors.text, textAlign: 'center' },
  meta: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary, marginTop: 4 },
  joinBtn: { marginTop: 14, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.coral },
  joinedBtn: { backgroundColor: colors.surfaceSunken },
  joinText: { fontFamily: fonts.generalSans.semiBold, fontSize: 13, color: colors.textInverse },
  joinedText: { color: colors.text },
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 },
  emptyText: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary },
  postCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  postTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text, marginBottom: 4 },
  postDesc: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postMeta: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary },
});
