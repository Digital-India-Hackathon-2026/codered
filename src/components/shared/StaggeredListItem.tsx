import React, { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface StaggeredListItemProps {
  index: number;
  delay?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const StaggeredListItem: React.FC<StaggeredListItemProps> = memo(({
  index,
  delay = 0,
  style,
  children,
}) => (
  <Animated.View
    entering={FadeIn.delay(delay + index * 30).duration(150)}
    style={style}
  >
    {children}
  </Animated.View>
));

export const useStaggeredEntrance = (_index: number, _options?: { delay?: number; stagger?: number }) => {
  return FadeIn.duration(150);
};
