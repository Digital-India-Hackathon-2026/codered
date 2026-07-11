import React, { memo, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring, FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '../shared/Icon';
import { colors, fonts } from '../../theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  voiceState?: 'idle' | 'recording' | 'paused' | 'processing';
  voiceText?: string;
  disabled?: boolean;
}

const VoiceOverlay = memo(({ voiceText, onStop }: { voiceText: string; onStop: () => void }) => {
  // Animated bars
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.7);
  const bar4 = useSharedValue(0.4);
  const bar5 = useSharedValue(0.6);

  useEffect(() => {
    const animate = (sv: any, min: number, max: number, dur: number) => {
      sv.value = withRepeat(withSequence(
        withTiming(max, { duration: dur }),
        withTiming(min, { duration: dur }),
      ), -1);
    };
    animate(bar1, 0.2, 0.9, 300);
    animate(bar2, 0.3, 1, 250);
    animate(bar3, 0.2, 0.8, 350);
    animate(bar4, 0.4, 1, 280);
    animate(bar5, 0.2, 0.7, 320);
  }, []);

  const b1 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar1.value }] }));
  const b2 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar2.value }] }));
  const b3 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar3.value }] }));
  const b4 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar4.value }] }));
  const b5 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar5.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={s.voiceOverlay}>
      <View style={s.voiceContent}>
        <View style={s.barsContainer}>
          <Animated.View style={[s.bar, b1]} />
          <Animated.View style={[s.bar, b2]} />
          <Animated.View style={[s.bar, b3]} />
          <Animated.View style={[s.bar, b4]} />
          <Animated.View style={[s.bar, b5]} />
        </View>
        <Text style={s.voiceTranscript} numberOfLines={2}>
          {voiceText || 'Listening...'}
        </Text>
      </View>
      <Pressable onPress={onStop} style={s.stopBtn} hitSlop={8}>
        <Icon name="Stop" size={16} color="#FFFFFF" weight="fill" />
      </Pressable>
    </Animated.View>
  );
});

export const ChatInput: React.FC<ChatInputProps> = memo(({
  value, onChangeText, onSend, onAttach, onVoiceStart, onVoiceStop,
  voiceState = 'idle', voiceText, disabled,
}) => {
  const hasText = value.trim().length > 0;
  const [focused, setFocused] = useState(false);
  const isVoiceActive = voiceState === 'recording' || voiceState === 'paused' || voiceState === 'processing';

  // Send button spring
  const sendScale = useSharedValue(1);
  useEffect(() => {
    sendScale.value = withSpring(hasText ? 1 : 0.9, { damping: 12 });
  }, [hasText]);
  const sendAnim = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));

  if (isVoiceActive) {
    return (
      <View style={s.container}>
        <VoiceOverlay voiceText={voiceText || ''} onStop={onVoiceStop!} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={[s.inputRow, focused && s.inputRowFocused]}>
        <Pressable hitSlop={10} onPress={onAttach} style={s.plusBtn}>
          <Icon name="Plus" size={18} color={colors.textTertiary} weight="bold" />
        </Pressable>

        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Message..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={2000}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="default"
        />

        {hasText ? (
          <Animated.View style={sendAnim}>
            <Pressable
              onPress={onSend}
              disabled={disabled}
              style={s.sendBtn}
              hitSlop={8}
            >
              <Icon name="ArrowUp" size={16} color="#FFFFFF" weight="bold" />
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable onPress={onVoiceStart} style={s.micBtn} hitSlop={8}>
            <Icon name="Microphone" size={20} color={colors.text} weight="regular" />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  inputRowFocused: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.generalSans.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  // Voice overlay
  voiceOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  voiceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  bar: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  voiceTranscript: {
    flex: 1,
    fontFamily: fonts.generalSans.regular,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  stopBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
