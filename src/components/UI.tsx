import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';

// Button
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, icon, style }: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
    style={[
      styles.button,
      variant === 'primary' && styles.buttonPrimary,
      variant === 'secondary' && styles.buttonSecondary,
      variant === 'outline' && styles.buttonOutline,
      variant === 'ghost' && styles.buttonGhost,
      disabled && styles.buttonDisabled,
      style,
    ]}>
    {loading ? (
      <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
    ) : (
      <View style={styles.buttonContent}>
        {icon}
        <Text style={[
          styles.buttonText,
          variant === 'outline' && { color: colors.primary },
          variant === 'ghost' && { color: colors.textSecondary },
          variant === 'secondary' && { color: colors.text },
        ]}>
          {title}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// Input
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, style, ...props }: InputProps) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      {icon && <View style={styles.inputIcon}>{icon}</View>}
      <TextInput
        style={[styles.input, icon ? { paddingLeft: 0 } : undefined, style]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Card
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card = ({ children, style, onPress }: CardProps) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.7} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
};

// Badge
export const Badge = ({ text, color = colors.textSecondary }: { text: string; color?: string }) => (
  <View style={[styles.badge, { backgroundColor: color + '12' }]}>
    <Text style={[styles.badgeText, { color }]}>{text}</Text>
  </View>
);

// Section Header
export const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Empty State
export const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: '#F4F4F5' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { opacity: 0.4 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  buttonText: { ...typography.cardTitle, color: '#fff' },
  inputContainer: { marginBottom: spacing.lg },
  inputLabel: { ...typography.meta, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  inputError: { borderColor: colors.danger },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, height: 44, ...typography.body, color: colors.text },
  errorText: { ...typography.meta, color: colors.danger, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeText: { ...typography.meta, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.sectionTitle, color: colors.text },
  sectionAction: { ...typography.caption, color: colors.primary, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyIcon: { fontSize: 32, marginBottom: spacing.lg, opacity: 0.4 },
  emptyTitle: { ...typography.cardTitle, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 },
});
