import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { fonts } from '../../theme';

export const SplashScreen = () => {
  const orbScale = useSharedValue(0.3);
  const orbOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(8);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Orb appears fast with spring
    orbOpacity.value = withTiming(1, { duration: 200 });
    orbScale.value = withSpring(1, { damping: 12, stiffness: 120 });

    // Glow ring expands behind orb
    glowOpacity.value = withDelay(100, withTiming(0.4, { duration: 300 }));
    glowScale.value = withDelay(100, withSpring(1.8, { damping: 10, stiffness: 80 }));

    // Text slides up
    textOpacity.value = withDelay(300, withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }));
    textY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 100 }));
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <View style={s.root}>
      {/* Glow ring */}
      <Animated.View style={[s.glow, glowStyle]}>
        <LinearGradient
          colors={['rgba(239,68,68,0.3)', 'rgba(245,158,11,0.2)', 'rgba(16,185,129,0.1)', 'transparent']}
          style={s.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Orb */}
      <Animated.View style={[s.orbWrap, orbStyle]}>
        <LinearGradient
          colors={['#EF4444', '#F59E0B', '#10B981']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={s.orb}
        />
      </Animated.View>

      {/* Wordmark */}
      <Animated.Text style={[s.wordmark, textStyle]}>
        LifeLens
      </Animated.Text>
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    borderRadius: 60,
  },
  orbWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 16,
  },
  orb: {
    flex: 1,
  },
  wordmark: {
    fontFamily: fonts.fraunces.semiBold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
