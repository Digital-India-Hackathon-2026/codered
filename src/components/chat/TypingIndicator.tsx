import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay } from 'react-native-reanimated';
import { Icon } from '../shared';
import { colors, spacing } from '../../theme';

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 400 }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s.dot, style]} />;
};

export const TypingIndicator: React.FC = memo(() => (
  <View style={s.container}>
    <View style={s.avatar}>
      <Icon name="cpu" size={12} color={colors.primary} />
    </View>
    <View style={s.dots}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
  },
  dots: { flexDirection: 'row', gap: 4, paddingVertical: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary },
});
