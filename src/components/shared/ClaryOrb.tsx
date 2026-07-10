import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { colors, motion } from '../../theme';

interface ClaryOrbProps {
  size?: number;
  streaming?: boolean;
  showGlow?: boolean;
  glow?: boolean;
}

const ClaryOrb: React.FC<ClaryOrbProps> = ({
  size = 48,
  streaming = false,
  showGlow,
  glow,
}) => {
  const shouldGlow = showGlow ?? glow ?? false;
  const glowSize = size * 2.5;
  const scale = useSharedValue(1);

  useEffect(() => {
    const duration = streaming ? motion.orbPulseDuration : motion.orbBreathDuration;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [streaming]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { width: shouldGlow ? glowSize : size, height: shouldGlow ? glowSize : size }]}>
      {shouldGlow && (
        <Svg width={glowSize} height={glowSize} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.coral} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={colors.coral} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill="url(#orbGlow)" />
        </Svg>
      )}
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, animStyle]}>
        <LinearGradient
          colors={colors.gradient.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: size / 2 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});

export default ClaryOrb;
