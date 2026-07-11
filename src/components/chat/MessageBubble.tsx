import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, radius, fonts } from '../../theme';

interface MessageBubbleProps {
  content: string;
  imageUrl?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ content, imageUrl }) => (
  <View style={s.container}>
    <View style={s.bubble}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />}
      {content ? <Text style={s.text}>{content}</Text> : null}
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 16 },
  bubble: {
    maxWidth: '80%',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  image: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },
  text: { fontFamily: fonts.generalSans.regular, fontSize: 15, lineHeight: 22, color: colors.text },
});
