import React, { memo } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, radius, typography } from '../../theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = memo(({ value, onChangeText, onSend, disabled }) => (
  <View style={s.container}>
    <View style={s.inputRow}>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask Clary about your health..."
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={2000}
        editable={!disabled}
      />
      <Pressable
        style={[s.sendBtn, (!value.trim() || disabled) && { opacity: 0.3 }]}
        onPress={onSend}
        disabled={!value.trim() || disabled}
      >
        <Icon name="arrow-up" size={18} color="#FFF" />
      </Pressable>
    </View>
  </View>
));

const s = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1, ...typography.body, color: colors.text,
    backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    maxHeight: 100, borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
});
