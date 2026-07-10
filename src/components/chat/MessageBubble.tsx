import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

interface MessageBubbleProps {
  content: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ content }) => (
  <View style={s.container}>
    <View style={s.bubble}>
      <Text style={s.text}>{content}</Text>
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { alignItems: 'flex-end', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  bubble: {
    maxWidth: '80%', backgroundColor: colors.primary,
    borderRadius: radius.md, borderBottomRightRadius: 4,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  text: { ...typography.body, color: '#FFFFFF' },
});
