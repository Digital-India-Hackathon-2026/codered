import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { MotiView } from './MotiView';
import { motion } from '../../theme';

interface AnimatedPressableProps extends PressableProps {
  style?: ViewStyle | (ViewStyle | undefined)[];
  children: React.ReactNode;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  style,
  children,
  ...rest
}) => {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPressIn={(e) => { setPressed(true); rest.onPressIn?.(e); }}
      onPressOut={(e) => { setPressed(false); rest.onPressOut?.(e); }}
      {...rest}
    >
      <MotiView
        animate={{ scale: pressed ? motion.pressScale : 1 }}
        transition={{ type: 'timing', duration: 150 }}
        style={style as any}
      >
        {children}
      </MotiView>
    </Pressable>
  );
};
