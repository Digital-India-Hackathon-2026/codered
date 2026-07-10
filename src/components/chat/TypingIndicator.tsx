import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import ClaryOrb from '../shared/ClaryOrb';
import { colors, radius } from '../../theme';

const Dot = ({ delay }: { delay: number }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1, { duration: 300 }), withTiming(0.6, { duration: 300 })),
      -1, false
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })),
      -1, false
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[s.dot, style]} />;
};

export const TypingIndicator: React.FC = memo(() => (
  <View style={s.container}>
    <ClaryOrb size={24} glow={false} streaming />
    <View style={s.bubble}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, alignItems: 'center', gap: 8 },
  bubble: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textTertiary },
});
