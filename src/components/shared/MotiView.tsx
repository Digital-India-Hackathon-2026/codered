// Drop-in replacement for MotiView using react-native-reanimated directly
// This avoids the duplicate React instance issue with moti + framer-motion
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface MotiViewProps {
  from?: { opacity?: number; translateY?: number; translateX?: number; scale?: number };
  animate?: { opacity?: number; translateY?: number; translateX?: number; scale?: number };
  transition?: {
    type?: 'timing' | 'spring';
    duration?: number;
    delay?: number;
    loop?: boolean;
    repeatReverse?: boolean;
  };
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export const MotiView: React.FC<MotiViewProps> = ({
  from,
  animate,
  transition,
  style,
  children,
}) => {
  const opacity = useSharedValue(from?.opacity ?? animate?.opacity ?? 1);
  const translateY = useSharedValue(from?.translateY ?? animate?.translateY ?? 0);
  const translateX = useSharedValue(from?.translateX ?? animate?.translateX ?? 0);
  const scale = useSharedValue(from?.scale ?? animate?.scale ?? 1);

  useEffect(() => {
    const duration = transition?.duration ?? 300;
    const delay = transition?.delay ?? 0;
    const config = { duration, easing: Easing.out(Easing.ease) };

    const doAnimate = () => {
      if (animate?.opacity !== undefined) {
        opacity.value = withTiming(animate.opacity, config);
      }
      if (animate?.translateY !== undefined) {
        translateY.value = withTiming(animate.translateY, config);
      }
      if (animate?.translateX !== undefined) {
        translateX.value = withTiming(animate.translateX, config);
      }
      if (animate?.scale !== undefined) {
        scale.value = withTiming(animate.scale, config);
      }
    };

    if (delay > 0) {
      const timer = setTimeout(doAnimate, delay);
      return () => clearTimeout(timer);
    } else {
      doAnimate();
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default MotiView;
