import React, { useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  style?: ViewStyle | (ViewStyle | undefined)[];
  children: React.ReactNode;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}) => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback((e: any) => {
    opacity.value = withTiming(0.7, { duration: 100 });
    onPressIn?.(e);
  }, [onPressIn]);

  const handlePressOut = useCallback((e: any) => {
    opacity.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  }, [onPressOut]);

  return (
    <AnimatedPressableBase
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
};
