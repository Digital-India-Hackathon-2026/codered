import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { StaggeredListItem } from '../../components/shared';
import { colors, radius, fonts } from '../../theme';

interface TimelineEvent {
  when: string;
  title: string;
  detail: string;
  icon: 'Heartbeat' | 'Pill' | 'FileText' | 'FirstAid';
  tint: string;
  iconColor: string;
  severity?: 'high' | 'moderate' | 'low';
}

const events: TimelineEvent[] = [
  { when: 'TODAY, 09:12', title: 'Migraine episode', detail: 'Throbbing, ~3h. Ibuprofen 400mg.', icon: 'Heartbeat', tint: colors.coralSoft, iconColor: colors.coral, severity: 'high' },
  { when: 'YESTERDAY', title: 'Vitamin D taken', detail: '1000 IU · morning', icon: 'Pill', tint: '#FEF3C7', iconColor: colors.amber },
  { when: 'MON 8 JUN', title: 'Blood report uploaded', detail: 'Complete blood count · 4 findings', icon: 'FileText', tint: '#EEF4FF', iconColor: '#3B82F6' },
  { when: 'FRI 5 JUN', title: 'Dr. Kapoor consultation', detail: 'General physician · Follow-up in 2 weeks', icon: 'FirstAid', tint: '#D1FAE5', iconColor: colors.sage },
];

export const TimelineScreen = () => (
  <SafeAreaView style={s.root} edges={['top']}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <StaggeredListItem index={0}>
        <Text style={s.eyebrow}>HISTORY</Text>
        <Text style={s.h1}>Timeline</Text>
      </StaggeredListItem>

      <View style={s.timeline}>
        <View style={s.rail} />

        {events.map((ev, i) => {
          const isFirst = i === 0;
          return (
            <StaggeredListItem key={i} index={i + 1}>
              <View style={s.eventRow}>
                <View style={s.dotCol}>
                  <View style={[s.dot, isFirst && s.dotActive]} />
                </View>
                <View style={[s.card, ev.severity === 'high' && s.cardHigh]}>
                  <View style={s.cardRow}>
                    <View style={[s.iconBox, { backgroundColor: ev.tint }]}>
                      <Icon name={ev.icon} size={18} color={ev.iconColor} weight="fill" />
                    </View>
                    <View style={s.cardText}>
                      <Text style={s.when}>{ev.when}</Text>
                      <Text style={s.title}>{ev.title}</Text>
                      <Text style={s.detail} numberOfLines={2}>{ev.detail}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </StaggeredListItem>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  </SafeAreaView>
);

const DOT_SIZE = 10;
const RAIL_LEFT = 16;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12 },

  eyebrow: { fontFamily: fonts.generalSans.semiBold, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary, marginBottom: 4 },
  h1: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34, color: colors.text, marginBottom: 20 },

  timeline: { position: 'relative', paddingBottom: 8 },
  rail: {
    position: 'absolute',
    left: RAIL_LEFT + (DOT_SIZE / 2) - 1,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: colors.border,
  },

  eventRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },

  dotCol: {
    width: RAIL_LEFT * 2 + DOT_SIZE,
    alignItems: 'center',
    paddingTop: 18,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.background,
  },
  dotActive: { backgroundColor: colors.coral },

  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHigh: { borderLeftWidth: 3, borderLeftColor: colors.coral },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  cardText: { flex: 1 },
  when: { fontFamily: fonts.generalSans.semiBold, fontSize: 10, letterSpacing: 1, color: colors.textTertiary, marginBottom: 3 },
  title: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text, marginBottom: 2 },
  detail: { fontFamily: fonts.generalSans.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
});
