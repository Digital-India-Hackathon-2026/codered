import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/shared/Icon';
import { StaggeredListItem } from '../../components/shared';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

interface Post {
  id: number;
  author: { id: number; username: string; image_src: string; account_type: string };
  category: string;
  intent: string;
  title: string;
  description?: string;
  likes_count?: number;
  comments_count?: number;
}

interface AmaQuestion {
  id: number;
  title: string;
  description: string;
  looking_for?: string[];
  speciality_logo?: string;
}

interface Community {
  id: number;
  title: string;
  logo_url: string;
  category: string;
  member_count?: number;
}

interface BloodRequest {
  id: number;
  blood_group: string;
  urgency: string;
  units?: number;
  hospital?: string;
  city?: string;
  contact_number?: string;
  patient_name?: string;
  notes?: string;
  needed_by?: string;
  offers_count?: number;
  created_at?: string;
  author?: { username: string };
}

const DUMMY_BLOOD_REQUESTS: BloodRequest[] = [
  { id: 1001, blood_group: 'O+', urgency: 'critical', units: 3, hospital: 'Apollo Hospital, Jubilee Hills', city: 'Hyderabad', contact_number: '+91 98765 43210', patient_name: 'Ramesh K.', needed_by: 'Today', offers_count: 2, notes: 'Accident case, urgent requirement for surgery.' },
  { id: 1002, blood_group: 'A-', urgency: 'urgent', units: 2, hospital: 'KIMS Hospital', city: 'Secunderabad', contact_number: '+91 87654 32109', patient_name: 'Lakshmi D.', needed_by: 'Tomorrow', offers_count: 0, notes: 'Scheduled surgery, need A- or O- donors.' },
  { id: 1003, blood_group: 'B+', urgency: 'normal', units: 1, hospital: 'Yashoda Hospital', city: 'Hyderabad', contact_number: '+91 76543 21098', needed_by: 'This week', offers_count: 4 },
  { id: 1004, blood_group: 'AB+', urgency: 'critical', units: 2, hospital: 'Care Hospital, Banjara Hills', city: 'Hyderabad', contact_number: '+91 65432 10987', patient_name: 'Suresh M.', needed_by: 'ASAP', offers_count: 1, notes: 'Thalassemia patient, regular transfusion needed.' },
  { id: 1005, blood_group: 'O-', urgency: 'urgent', units: 4, hospital: 'Gandhi Hospital', city: 'Hyderabad', contact_number: '+91 54321 09876', needed_by: 'Today', offers_count: 0, notes: 'Universal donor needed. Multiple patients.' },
  { id: 1006, blood_group: 'A+', urgency: 'normal', units: 1, hospital: 'Continental Hospital', city: 'Hyderabad', contact_number: '+91 43210 98765', patient_name: 'Priya S.', needed_by: '3 days', offers_count: 3 },
];

type Tab = 'feed' | 'ama' | 'blood' | 'communities';

export const FeedScreen = () => {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [ama, setAma] = useState<AmaQuestion[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, amaRes, commRes, bloodRes] = await Promise.allSettled([
        api.get('/public/posts'),
        api.get('/public/ama-feed'),
        api.post('/community_pages/discover-communities', {}),
        api.get('/blood-requests'),
      ]);
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data?.posts || []);
      if (amaRes.status === 'fulfilled') setAma(amaRes.value.data?.questions || []);
      if (commRes.status === 'fulfilled') setCommunities(commRes.value.data?.communities || []);
      if (bloodRes.status === 'fulfilled') {
        const apiRequests = bloodRes.value.data?.requests || [];
        setBloodRequests(apiRequests.length > 0 ? apiRequests : DUMMY_BLOOD_REQUESTS);
      } else {
        setBloodRequests(DUMMY_BLOOD_REQUESTS);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.h1}>Discover</Text>
      </View>

      <View style={s.tabs}>
        {(['feed', 'ama', 'blood', 'communities'] as Tab[]).map(t => (
          <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabActive]}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'feed' ? 'Posts' : t === 'ama' ? 'Ask Doctors' : t === 'blood' ? 'Blood' : 'Communities'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />}
      >
        {tab === 'feed' && (
          posts.length === 0 && !loading
            ? <EmptyState text="No posts yet" />
            : posts.slice(0, 20).map((post, i) => (
              <StaggeredListItem key={post.id} index={i}>
                <Pressable style={s.card} onPress={() => navigation.navigate('PostDetail', { post })}>
                  <View style={s.cardHeader}>
                    <Image source={{ uri: post.author.image_src }} style={s.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.username} numberOfLines={1}>{post.author.username}</Text>
                      <Text style={s.category}>{post.category}</Text>
                    </View>
                    <View style={s.intentPill}>
                      <Text style={s.intentText}>{post.intent}</Text>
                    </View>
                  </View>
                  <Text style={s.postTitle} numberOfLines={2}>{post.title}</Text>
                  {post.description ? <Text style={s.postDesc} numberOfLines={3}>{post.description}</Text> : null}
                  <View style={s.cardFooter}>
                    <View style={s.stat}>
                      <Icon name="Heart" size={14} color={colors.textTertiary} weight="regular" />
                      <Text style={s.statText}>{post.likes_count || 0}</Text>
                    </View>
                    <View style={s.stat}>
                      <Icon name="ChatCircle" size={14} color={colors.textTertiary} weight="regular" />
                      <Text style={s.statText}>{post.comments_count || 0}</Text>
                    </View>
                  </View>
                </Pressable>
              </StaggeredListItem>
            ))
        )}

        {tab === 'ama' && (
          ama.length === 0 && !loading
            ? <EmptyState text="No questions yet" />
            : ama.slice(0, 20).map((q, i) => (
              <StaggeredListItem key={q.id} index={i}>
                <Pressable style={s.card} onPress={() => navigation.navigate('AmaDetail', { question: q })}>
                  <View style={s.cardHeader}>
                    {q.speciality_logo ? (
                      <Image source={{ uri: q.speciality_logo }} style={s.specLogo} />
                    ) : (
                      <View style={[s.specLogo, { backgroundColor: colors.coralSoft }]}>
                        <Icon name="Stethoscope" size={16} color={colors.coral} weight="fill" />
                      </View>
                    )}
                    <Text style={s.amaTitle} numberOfLines={2}>{q.title}</Text>
                  </View>
                  <Text style={s.postDesc} numberOfLines={3}>{q.description}</Text>
                  {q.looking_for && q.looking_for.length > 0 && (
                    <View style={s.tagsRow}>
                      {q.looking_for.slice(0, 2).map(tag => (
                        <View key={tag} style={s.tag}>
                          <Text style={s.tagText} numberOfLines={1}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              </StaggeredListItem>
            ))
        )}

        {tab === 'blood' && (
          bloodRequests.length === 0 && !loading
            ? <EmptyState text="No blood requests yet" />
            : bloodRequests.slice(0, 20).map((req, i) => (
              <StaggeredListItem key={req.id} index={i}>
                <Pressable style={s.card} onPress={() => navigation.navigate('BloodRequestDetail', { request: req })}>
                  <View style={s.cardHeader}>
                    <View style={[s.bloodIcon, { backgroundColor: req.urgency === 'critical' ? '#FEE2E2' : req.urgency === 'urgent' ? '#FEF3C7' : '#D1FAE5' }]}>
                      <Icon name="Drop" size={16} color={req.urgency === 'critical' ? '#DC2626' : req.urgency === 'urgent' ? '#F59E0B' : '#10B981'} weight="fill" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bloodGroup}>{req.blood_group}</Text>
                      <Text style={s.category}>{req.units || 1} unit(s) · {req.urgency}</Text>
                    </View>
                    <View style={[s.urgencyPill, { backgroundColor: req.urgency === 'critical' ? '#FEE2E2' : req.urgency === 'urgent' ? '#FEF3C7' : '#D1FAE5' }]}>
                      <Text style={[s.urgencyPillText, { color: req.urgency === 'critical' ? '#DC2626' : req.urgency === 'urgent' ? '#F59E0B' : '#10B981' }]}>{req.urgency}</Text>
                    </View>
                  </View>
                  {req.hospital && <Text style={s.postDesc} numberOfLines={1}>{req.hospital}</Text>}
                  <View style={s.cardFooter}>
                    <View style={s.stat}>
                      <Icon name="MapPin" size={12} color={colors.textTertiary} weight="regular" />
                      <Text style={s.statText}>{req.city || 'Unknown'}</Text>
                    </View>
                    {(req.offers_count || 0) > 0 && (
                      <View style={s.stat}>
                        <Icon name="Users" size={12} color={colors.sage} weight="regular" />
                        <Text style={[s.statText, { color: colors.sage }]}>{req.offers_count} offered</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </StaggeredListItem>
            ))
        )}

        {tab === 'communities' && (
          communities.length === 0 && !loading
            ? <EmptyState text="No communities yet" />
            : communities.slice(0, 20).map((c, i) => (
              <StaggeredListItem key={c.id} index={i}>
                <Pressable style={s.communityCard} onPress={() => navigation.navigate('CommunityDetail', { community: c })}>
                  <Image source={{ uri: c.logo_url }} style={s.communityLogo} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.communityTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={s.communityMeta}>{c.category} · {c.member_count || 0} members</Text>
                  </View>
                  <Icon name="CaretRight" size={16} color={colors.textTertiary} weight="regular" />
                </Pressable>
              </StaggeredListItem>
            ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => navigation.navigate(tab === 'blood' ? 'CreateBloodRequest' : 'CreatePost')}>
        <Icon name={tab === 'blood' ? 'Drop' : 'Plus'} size={22} color={colors.textInverse} weight="bold" />
      </Pressable>
    </SafeAreaView>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <View style={s.empty}>
    <Icon name="MagnifyingGlass" size={32} color={colors.textTertiary} weight="regular" />
    <Text style={s.emptyText}>{text}</Text>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  h1: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34, color: colors.text },
  content: { paddingHorizontal: 24, paddingTop: 8 },

  tabs: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
  tabActive: { backgroundColor: colors.text },
  tabText: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.textInverse },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceSunken },
  username: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text },
  category: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary },
  intentPill: { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  intentText: { fontFamily: fonts.generalSans.medium, fontSize: 10, color: colors.textSecondary, textTransform: 'capitalize' },
  postTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text, marginBottom: 4 },
  postDesc: { fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary },

  specLogo: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.surfaceSunken, justifyContent: 'center', alignItems: 'center' },
  amaTitle: { flex: 1, fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  tag: { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textSecondary },

  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  communityLogo: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
  communityTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  communityMeta: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textTertiary, marginTop: 2 },

  bloodIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bloodGroup: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  urgencyPill: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  urgencyPillText: { fontFamily: fonts.generalSans.semiBold, fontSize: 10, textTransform: 'capitalize' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textTertiary },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
