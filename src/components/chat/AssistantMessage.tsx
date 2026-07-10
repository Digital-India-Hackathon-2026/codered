import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../shared';
import { colors, spacing, radius, typography } from '../../theme';

interface AssistantMessageProps {
  content: string;
}

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed && i > 0) { elements.push(<View key={`sp-${i}`} style={{ height: 6 }} />); return; }
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<View key={i} style={s.bulletRow}><Text style={s.bullet}>•</Text><Text style={s.text}>{parseInline(trimmed.slice(2))}</Text></View>);
      return;
    }
    const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      elements.push(<View key={i} style={s.bulletRow}><Text style={s.numBullet}>{numMatch[1]}.</Text><Text style={s.text}>{parseInline(numMatch[2])}</Text></View>);
      return;
    }
    elements.push(<Text key={i} style={s.text}>{parseInline(trimmed)}</Text>);
  });
  return elements;
};

const parseInline = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\$\*\/(.+?)\/\*\$|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const boldText = match[1] || match[2] || match[3];
    parts.push(<Text key={match.index} style={s.bold}>{boldText}</Text>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
};

export const AssistantMessage: React.FC<AssistantMessageProps> = memo(({ content }) => (
  <View style={s.container}>
    <View style={s.avatar}>
      <Icon name="cpu" size={12} color={colors.primary} />
    </View>
    <View style={s.content}>
      {renderMarkdown(content)}
    </View>
  </View>
));

const s = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm, marginTop: 2,
  },
  content: { flex: 1 },
  text: { ...typography.body, color: colors.text, lineHeight: 22 },
  bold: { fontWeight: '600', color: colors.text },
  bulletRow: { flexDirection: 'row', marginTop: spacing.xs },
  bullet: { ...typography.body, color: colors.textTertiary, marginRight: spacing.sm, width: 12 },
  numBullet: { ...typography.body, color: colors.textTertiary, marginRight: spacing.sm, width: 18 },
});
