import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import ClaryOrb from '../shared/ClaryOrb';
import { colors } from '../../theme';

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 350 })),
      -1, false
    ));
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s.dot, style]} />;
};

export const TypingIndicator: React.FC = memo(() => (
  <View style={s.container}>
    <ClaryOrb size={22} glow={false} streaming />
    <View style={s.dots}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, alignItems: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 4, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary },
});
