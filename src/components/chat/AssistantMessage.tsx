import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, FadeIn } from 'react-native-reanimated';
import ClaryOrb from '../shared/ClaryOrb';
import { colors, fonts } from '../../theme';

interface AssistantMessageProps {
  content: string;
  streaming?: boolean;
}

const cleanMarkers = (text: string): string => {
  return text.replace(/\$\*\//g, '').replace(/\/\*\$/g, '');
};

const parseBold = (text: string): React.ReactNode[] => {
  const regex = /\$\*\/(.*?)\/\*\$/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Text key={lastIndex}>{text.slice(lastIndex, match.index)}</Text>);
    }
    parts.push(<Text key={match.index} style={s.bold}>{match[1]}</Text>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex === 0) {
    const mdParts = text.split(/\*\*(.*?)\*\*/);
    if (mdParts.length > 1) {
      return mdParts.map((part, i) =>
        i % 2 === 1
          ? <Text key={i} style={s.bold}>{part}</Text>
          : <Text key={i}>{part}</Text>
      );
    }
    return [<Text key={0}>{cleanMarkers(text)}</Text>];
  }

  if (lastIndex < text.length) {
    parts.push(<Text key={lastIndex}>{cleanMarkers(text.slice(lastIndex))}</Text>);
  }
  return parts;
};

const renderContent = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed && i > 0) { elements.push(<View key={`sp-${i}`} style={{ height: 8 }} />); return; }
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <View key={i} style={s.bulletRow}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.text}>{parseBold(trimmed.slice(2))}</Text>
        </View>
      );
      return;
    }
    const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      elements.push(
        <View key={i} style={s.bulletRow}>
          <Text style={s.numBullet}>{numMatch[1]}.</Text>
          <Text style={s.text}>{parseBold(numMatch[2])}</Text>
        </View>
      );
      return;
    }
    elements.push(<Text key={i} style={s.text}>{parseBold(trimmed)}</Text>);
  });
  return elements;
};

const StreamingCursor = () => {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 400 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.Text style={[s.cursor, style]}>|</Animated.Text>;
};

export const AssistantMessage: React.FC<AssistantMessageProps> = memo(({ content, streaming }) => (
  <Animated.View entering={FadeIn.duration(200)} style={s.container}>
    <ClaryOrb size={22} glow={false} streaming={streaming} />
    <View style={s.content}>
      {content ? (
        <View>
          {renderContent(content)}
          {streaming && <StreamingCursor />}
        </View>
      ) : streaming ? (
        <StreamingCursor />
      ) : null}
    </View>
  </Animated.View>
));

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, alignItems: 'flex-start', gap: 10 },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  text: { fontFamily: fonts.generalSans.regular, fontSize: 15, lineHeight: 24, color: colors.text },
  bold: { fontFamily: fonts.generalSans.semiBold, color: colors.text },
  bulletRow: { flexDirection: 'row', marginTop: 4 },
  bullet: { fontFamily: fonts.generalSans.regular, fontSize: 15, color: colors.textSecondary, marginRight: 8, width: 12 },
  numBullet: { fontFamily: fonts.generalSans.regular, fontSize: 15, color: colors.textSecondary, marginRight: 8, width: 20 },
  cursor: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.text },
});
