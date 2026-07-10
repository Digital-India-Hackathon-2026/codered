import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

interface Comment {
  id: number;
  author: { username: string; image_src: string };
  content: string;
  created_at?: string;
}

export const PostDetailScreen = ({ route, navigation }: any) => {
  const { post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  useEffect(() => {
    api.get(`/public/posts/${post.id}/comments`).then(res => {
      setComments(res.data?.comments || []);
    }).catch(() => {});
  }, [post.id]);

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount((c: number) => liked ? c - 1 : c + 1);
    try { await api.post(`/posts/${post.id}/like`); } catch {}
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setComments(prev => [...prev, { id: Date.now(), author: { username: 'You', image_src: '' }, content: newComment.trim() }]);
      setNewComment('');
    } catch {}
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="ArrowLeft" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Post</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.authorRow}>
            <Image source={{ uri: post.author.image_src }} style={s.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={s.username}>{post.author.username}</Text>
              <Text style={s.category}>{post.category}</Text>
            </View>
            <View style={s.intentPill}>
              <Text style={s.intentText}>{post.intent}</Text>
            </View>
          </View>

          <Text style={s.title}>{post.title}</Text>
          {post.description ? <Text style={s.desc}>{post.description}</Text> : null}

          <View style={s.actions}>
            <Pressable onPress={handleLike} style={s.actionBtn}>
              <Icon name="Heart" size={18} color={liked ? colors.coral : colors.textTertiary} weight={liked ? 'fill' : 'regular'} />
              <Text style={[s.actionText, liked && { color: colors.coral }]}>{likesCount}</Text>
            </Pressable>
            <View style={s.actionBtn}>
              <Icon name="ChatCircle" size={18} color={colors.textTertiary} weight="regular" />
              <Text style={s.actionText}>{comments.length || post.comments_count || 0}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Comments</Text>
          {comments.length === 0 ? (
            <Text style={s.emptyText}>No comments yet. Be the first!</Text>
          ) : (
            comments.map(c => (
              <View key={c.id} style={s.commentCard}>
                <Image source={{ uri: c.author.image_src }} style={s.commentAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={s.commentAuthor}>{c.author.username}</Text>
                  <Text style={s.commentContent}>{c.content}</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textTertiary}
            value={newComment}
            onChangeText={setNewComment}
          />
          <Pressable onPress={handleComment} style={[s.sendBtn, !newComment.trim() && { opacity: 0.4 }]}>
            <Icon name="PaperPlaneTilt" size={18} color={colors.textInverse} weight="fill" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSunken },
  username: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  category: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary },
  intentPill: { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  intentText: { fontFamily: fonts.generalSans.medium, fontSize: 11, color: colors.textSecondary, textTransform: 'capitalize' },
  title: { fontFamily: fonts.generalSans.semiBold, fontSize: 18, color: colors.text, marginBottom: 8 },
  desc: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.textTertiary },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 },
  emptyText: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary },
  commentCard: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceSunken },
  commentAuthor: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.text },
  commentContent: { fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary, marginTop: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: 10 },
  input: { flex: 1, fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.text, backgroundColor: colors.surfaceSunken, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.coral, justifyContent: 'center', alignItems: 'center' },
});
