import React, { memo, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from '../shared/Icon';
import { colors, radius, fonts } from '../../theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ChatInput: React.FC<ChatInputProps> = memo(({ value, onChangeText, onSend, disabled }) => {
  const hasText = value.trim().length > 0;
  const [focused, setFocused] = useState(false);

  const sendScale = useSharedValue(hasText ? 1 : 0.8);
  const sendOpacity = useSharedValue(hasText ? 1 : 0.4);

  React.useEffect(() => {
    sendScale.value = withSpring(hasText ? 1 : 0.8, { damping: 15 });
    sendOpacity.value = withTiming(hasText ? 1 : 0.4, { duration: 150 });
  }, [hasText]);

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: sendOpacity.value,
  }));

  return (
    <View style={s.wrapper}>
      <LinearGradient colors={colors.gradient.fadeBottom} style={s.fade} pointerEvents="none" />
      <View style={s.container}>
        <View style={[s.pill, focused && s.pillFocused]}>
          <Pressable hitSlop={8} style={s.attachBtn}>
            <Icon name="Plus" size={18} color={colors.textTertiary} weight="regular" />
          </Pressable>
          <TextInput
            style={s.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Ask Clary about your health..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={2000}
            numberOfLines={4}
            editable={!disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <Animated.View style={sendStyle}>
            <Pressable
              style={[s.sendBtn, hasText && !disabled ? s.sendActive : s.sendDisabled]}
              onPress={onSend}
              disabled={!hasText || disabled}
            >
              <Icon
                name="PaperPlaneTilt"
                size={18}
                color={hasText && !disabled ? colors.textInverse : colors.textTertiary}
                weight="fill"
              />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrapper: { position: 'relative' },
  fade: { position: 'absolute', top: -24, left: 0, right: 0, height: 24 },
  container: { paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24, backgroundColor: colors.background },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  pillFocused: {
    borderColor: colors.textTertiary,
  },
  attachBtn: { paddingBottom: 8 },
  input: {
    flex: 1,
    fontFamily: fonts.generalSans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendBtn: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  sendActive: { backgroundColor: colors.coral },
  sendDisabled: { backgroundColor: colors.surfaceSunken },
});
