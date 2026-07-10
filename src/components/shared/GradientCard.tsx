import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, shadows, spacing } from '../../theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: [string, string];
  shadow?: 'sm' | 'card';
  style?: ViewStyle;
}

export const GradientCard: React.FC<GradientCardProps> = memo(({
  children,
  gradient = colors.gradient.coralAmber,
  shadow = 'card',
  style,
}) => (
  <LinearGradient
    colors={gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.card, shadows[shadow], style]}
  >
    {children}
  </LinearGradient>
));

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    overflow: 'hidden',
  },
});
