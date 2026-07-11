import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { healthConnect, HealthData } from '../../services/healthConnect';
import { AnimatedPressable, StaggeredListItem } from '../../components/shared';
import { Icon } from '../../components/shared/Icon';
import ClaryOrb from '../../components/shared/ClaryOrb';
import { colors, radius, fonts } from '../../theme';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - 24 * 2 - 12) / 2;

const TIPS = [
  'Drinking water first thing in the morning boosts metabolism by 24%.',
  'A 10-minute walk after meals can lower blood sugar spikes by 22%.',
  'Deep breathing for 5 minutes reduces cortisol levels significantly.',
  'Consistent sleep schedule improves immune function by 30%.',
  'Standing for 2 minutes every hour reduces cardiovascular risk.',
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [vitals, setVitals] = useState<HealthData | null>(null);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ), -1,
    );
  }, []);
  const heroAnim = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const loadData = useCallback(async () => {
    try {
      const avail = await healthConnect.checkAvailability();
      if (avail === 'available') {
        const inited = await healthConnect.init();
        if (inited && await healthConnect.hasPermissions()) {
          setVitals(await healthConnect.getHealthData());
        }
      }
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // Calculate health score (simple heuristic)
  const healthScore = calculateScore(vitals);

  const firstName = (user?.name || user?.username || 'there').split(' ')[0];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <StaggeredListItem index={0}>
          <Text style={s.greeting}>{getGreeting()},</Text>
          <Text style={s.name}>{firstName}</Text>
        </StaggeredListItem>

        {/* Health Score + Ask Vita Row */}
        <StaggeredListItem index={1}>
          <View style={s.topRow}>
            {/* Health Score Ring */}
            <View style={s.scoreCard}>
              <HealthRing score={healthScore} />
              <Text style={s.scoreLabel}>Health Score</Text>
            </View>

            {/* Ask Vita */}
            <AnimatedPressable onPress={() => navigation.navigate('ChatTab')} style={s.claryCard}>
              <Animated.View style={heroAnim}>
                <ClaryOrb size={40} />
              </Animated.View>
              <Text style={s.claryTitle}>Ask Vita</Text>
              <Text style={s.clarySub}>AI health assistant</Text>
              <View style={s.claryArrow}>
                <Icon name="ArrowRight" size={14} color={colors.coral} weight="bold" />
              </View>
            </AnimatedPressable>
          </View>
        </StaggeredListItem>

        {/* Live Vitals */}
        <StaggeredListItem index={2}>
          <AnimatedPressable onPress={() => navigation.navigate('VitalsTab')} style={s.vitalsCard}>
            <View style={s.vitalsHeader}>
              <Text style={s.vitalsTitle}>Today's Vitals</Text>
              <View style={s.livePill}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={s.metricsRow}>
              <VitalChip icon="Heartbeat" color={colors.coral} value={vitals?.heartRate?.bpm?.toString() || '--'} unit="bpm" />
              <VitalChip icon="PersonSimpleWalk" color={colors.sage} value={vitals?.steps ? formatNum(vitals.steps) : '--'} unit="steps" />
              <VitalChip icon="Moon" color="#3B82F6" value={vitals?.sleep ? `${vitals.sleep.hours}h` : '--'} unit="sleep" />
            </View>
          </AnimatedPressable>
        </StaggeredListItem>

        {/* Daily Tip */}
        <StaggeredListItem index={3}>
          <View style={s.tipCard}>
            <LinearGradient
              colors={['#FEF3C7', '#FFFBEB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.tipGradient}
            >
              <Icon name="Lightbulb" size={18} color={colors.amber} weight="fill" />
              <Text style={s.tipText}>{tip}</Text>
            </LinearGradient>
          </View>
        </StaggeredListItem>

        {/* Quick Actions */}
        <StaggeredListItem index={4}>
          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <View style={s.actionsGrid}>
            <ActionCard icon="Stethoscope" label="Symptom Check" tint={colors.coralSoft} iconColor={colors.coral} onPress={() => navigation.navigate('ChatTab')} />
            <ActionCard icon="Heartbeat" label="View Vitals" tint="#D1FAE5" iconColor={colors.sage} onPress={() => navigation.navigate('VitalsTab')} />
            <ActionCard icon="Compass" label="Discover" tint="#EEF4FF" iconColor="#3B82F6" onPress={() => navigation.navigate('TimelineTab')} />
            <ActionCard icon="Drop" label="Blood Requests" tint="#FEE2E2" iconColor={colors.coral} onPress={() => navigation.navigate('TimelineTab')} />
          </View>
        </StaggeredListItem>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Health Score Ring Component
const HealthRing = ({ score }: { score: number }) => {
  const size = 80;
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? colors.sage : score >= 50 ? colors.amber : colors.coral;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceSunken} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[s.scoreValue, { color }]}>{score}</Text>
    </View>
  );
};

const VitalChip = ({ icon, color, value, unit }: { icon: string; color: string; value: string; unit: string }) => (
  <View style={s.vitalChip}>
    <Icon name={icon} size={14} color={color} weight="fill" />
    <Text style={s.vitalValue}>{value}</Text>
    <Text style={s.vitalUnit}>{unit}</Text>
  </View>
);

const ActionCard = ({ icon, label, tint, iconColor, onPress }: { icon: string; label: string; tint: string; iconColor: string; onPress: () => void }) => (
  <AnimatedPressable onPress={onPress} style={s.actionCard}>
    <View style={[s.actionIcon, { backgroundColor: tint }]}>
      <Icon name={icon} size={20} color={iconColor} weight="duotone" />
    </View>
    <Text style={s.actionLabel} numberOfLines={2}>{label}</Text>
  </AnimatedPressable>
);

const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

const calculateScore = (vitals: HealthData | null): number => {
  if (!vitals) return 72; // Default decent score
  let score = 60;
  if (vitals.heartRate && vitals.heartRate.bpm >= 60 && vitals.heartRate.bpm <= 100) score += 10;
  if (vitals.steps >= 5000) score += 10;
  if (vitals.steps >= 8000) score += 5;
  if (vitals.sleep && vitals.sleep.hours >= 7) score += 10;
  if (vitals.spo2 && vitals.spo2 >= 95) score += 5;
  return Math.min(100, score);
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12 },

  greeting: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textSecondary },
  name: { fontFamily: fonts.fraunces.bold, fontSize: 28, color: colors.text, marginBottom: 20 },

  // Top row
  topRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreValue: { fontFamily: fonts.fraunces.bold, fontSize: 22 },
  scoreLabel: { fontFamily: fonts.generalSans.medium, fontSize: 11, color: colors.textTertiary, marginTop: 6 },

  claryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  claryTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text, marginTop: 8 },
  clarySub: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  claryArrow: { position: 'absolute', top: 12, right: 12 },

  // Vitals
  vitalsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vitalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  vitalsTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sage },
  liveText: { fontFamily: fonts.generalSans.semiBold, fontSize: 9, color: colors.sage, letterSpacing: 0.5 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  vitalChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingVertical: 12,
    gap: 4,
  },
  vitalValue: { fontFamily: fonts.fraunces.semiBold, fontSize: 20, color: colors.text },
  vitalUnit: { fontFamily: fonts.generalSans.regular, fontSize: 10, color: colors.textTertiary },

  // Tip
  tipCard: { marginBottom: 20, borderRadius: radius.lg, overflow: 'hidden' },
  tipGradient: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  tipText: { flex: 1, fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 18, color: colors.text },

  // Actions
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
  },
  actionIcon: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text },
});
