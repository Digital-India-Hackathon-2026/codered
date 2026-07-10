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
        const toVal = animate.opacity;
        if (transition?.loop) {
          opacity.value = withRepeat(
            withTiming(toVal, config),
            -1,
            transition?.repeatReverse ?? true
          );
        } else {
          opacity.value = withTiming(toVal, { ...config, duration: duration + delay });
        }
      }

      if (animate?.translateY !== undefined) {
        const toVal = animate.translateY;
        if (transition?.loop) {
          translateY.value = withRepeat(withTiming(toVal, config), -1, transition?.repeatReverse ?? true);
        } else {
          translateY.value = withTiming(toVal, { ...config, duration: duration + delay });
        }
      }

      if (animate?.translateX !== undefined) {
        const toVal = animate.translateX;
        if (transition?.loop) {
          translateX.value = withRepeat(withTiming(toVal, config), -1, transition?.repeatReverse ?? true);
        } else {
          translateX.value = withTiming(toVal, { ...config, duration: duration + delay });
        }
      }

      if (animate?.scale !== undefined) {
        const toVal = animate.scale;
        if (transition?.loop) {
          scale.value = withRepeat(withTiming(toVal, config), -1, transition?.repeatReverse ?? true);
        } else {
          scale.value = withTiming(toVal, { ...config, duration: duration + delay });
        }
      }
    };

    if (transition?.delay) {
      setTimeout(doAnimate, transition.delay);
    } else {
      doAnimate();
    }
  }, []);

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
