import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, spacing } from '../../theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: [string, string];
  shadow?: 'md' | 'lg';
  style?: ViewStyle;
}

export const GradientCard: React.FC<GradientCardProps> = memo(({
  children,
  gradient = colors.gradient.primary,
  style,
}) => (
  <LinearGradient
    colors={gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.card, style]}
  >
    {children}
  </LinearGradient>
));

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.xl,
    overflow: 'hidden',
  },
});
