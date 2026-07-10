import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInLeft, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import ClaryOrb from '../shared/ClaryOrb';
import { colors, radius, fonts } from '../../theme';

interface AssistantMessageProps {
  content: string;
  streaming?: boolean;
}

const cleanMarkers = (text: string): string => {
  // Remove incomplete/unmatched markers that appear during streaming
  return text.replace(/\$\*\//g, '').replace(/\/\*\$/g, '');
};

const parseBold = (text: string): React.ReactNode[] => {
  // Match $*/text/*$ pattern (bold markers from backend)
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
    // No $*/ markers found - try **text** markdown bold
    const mdParts = text.split(/\*\*(.*?)\*\*/);
    if (mdParts.length > 1) {
      return mdParts.map((part, i) =>
        i % 2 === 1
          ? <Text key={i} style={s.bold}>{part}</Text>
          : <Text key={i}>{part}</Text>
      );
    }
    // Clean any partial markers and return plain text
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
    if (!trimmed && i > 0) { elements.push(<View key={`sp-${i}`} style={{ height: 6 }} />); return; }
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
    opacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.Text style={[s.cursor, style]}>▋</Animated.Text>;
};

export const AssistantMessage: React.FC<AssistantMessageProps> = memo(({ content, streaming }) => (
  <Animated.View entering={FadeInLeft.duration(220).damping(18)} style={s.container}>
    <ClaryOrb size={24} glow={false} streaming={streaming} />
    <View style={s.bubble}>
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
  container: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, alignItems: 'flex-start', gap: 8 },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { fontFamily: fonts.generalSans.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  bold: { fontFamily: fonts.generalSans.semiBold, color: colors.text },
  bulletRow: { flexDirection: 'row', marginTop: 4 },
  bullet: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textTertiary, marginRight: 8, width: 12 },
  numBullet: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.textTertiary, marginRight: 8, width: 18 },
  cursor: { fontFamily: fonts.generalSans.regular, fontSize: 14, color: colors.coral },
});
