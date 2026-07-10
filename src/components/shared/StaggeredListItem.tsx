import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { MotiView } from './MotiView';

interface StaggeredListItemProps {
  index: number;
  delay?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const StaggeredListItem: React.FC<StaggeredListItemProps> = memo(({
  index,
  delay = 50,
  style,
  children,
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 12 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 350, delay: delay + index * 80 }}
    style={style}
  >
    {children}
  </MotiView>
));

export const useStaggeredEntrance = (_index: number, _options?: { delay?: number; stagger?: number }) => {
  return undefined;
};
