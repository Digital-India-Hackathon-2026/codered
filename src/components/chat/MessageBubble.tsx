import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors, radius, fonts } from '../../theme';

interface MessageBubbleProps {
  content: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ content }) => (
  <Animated.View entering={FadeInRight.duration(220).damping(18)} style={s.container}>
    <View style={s.bubble}>
      <Text style={s.text}>{content}</Text>
    </View>
  </Animated.View>
));

const s = StyleSheet.create({
  container: { alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 8 },
  bubble: {
    maxWidth: '78%',
    backgroundColor: colors.coral,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 20, color: colors.textInverse },
});
