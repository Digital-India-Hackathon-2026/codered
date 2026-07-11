import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClaryOrb from '../shared/ClaryOrb';
import { Icon } from '../shared/Icon';
import { colors, fonts, radius } from '../../theme';

interface ChatHeaderProps {
  onBack?: () => void;
  onMenu?: () => void;
  onNewChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = memo(({ onBack, onMenu, onNewChat }) => (
  <SafeAreaView edges={['top']} style={s.safe}>
    <View style={s.container}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={s.btn}>
          <Icon name="CaretLeft" size={20} color={colors.text} weight="bold" />
        </Pressable>
      )}
      <View style={s.center}>
        <ClaryOrb size={28} glow={false} />
        <View>
          <Text style={s.name}>Vita</Text>
          <View style={s.statusRow}>
            <View style={s.statusDot} />
            <Text style={s.status}>Online</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }} />

      {/* New Chat */}
      {onNewChat && (
        <Pressable onPress={onNewChat} hitSlop={12} style={s.btn}>
          <Icon name="PencilSimpleLine" size={20} color={colors.textSecondary} weight="regular" />
        </Pressable>
      )}

      {/* History */}
      {onMenu && (
        <Pressable onPress={onMenu} hitSlop={12} style={s.btn}>
          <Icon name="ClockCounterClockwise" size={20} color={colors.textSecondary} weight="regular" />
        </Pressable>
      )}
    </View>
  </SafeAreaView>
));

const s = StyleSheet.create({
  safe: { backgroundColor: colors.surface },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  btn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  center: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  name: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sage },
  status: { fontFamily: fonts.generalSans.medium, fontSize: 11, color: colors.sage },
});
