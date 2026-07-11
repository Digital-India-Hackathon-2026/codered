import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Pressable, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { deepgramVoice } from '../../services/deepgramVoice';
import { chatAPI } from '../../api/services';
import {
  ChatHeader,
  MessageBubble,
  AssistantMessage,
  TypingIndicator,
  ChatInput,
  QuickActions,
  PermissionCard,
  MCQCard,
  TextQuestionCard,
  SummaryCard,
} from '../../components/chat';
import { colors, fonts, radius } from '../../theme';
import { Icon } from '../../components/shared/Icon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: string;
  metadata?: any;
  answered?: boolean;
  error?: boolean;
  imageUrl?: string;
}

import { env } from '../../config/env';

const AI_BASE = env.AI_BASE_URL;
const UPLOAD_BASE = env.UPLOAD_BASE_URL;

export const ChatScreen = ({ navigation, route }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'paused' | 'processing'>('idle');
  const [voiceText, setVoiceText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { startSession(); }, []);

  useEffect(() => {
    const prefill = route?.params?.prefill;
    if (prefill && sessionId) {
      sendMessage(prefill);
      navigation.setParams({ prefill: undefined });
    }
  }, [route?.params?.prefill, sessionId]);

  const startSession = async () => {
    try {
      const { data } = await chatAPI.createThread(5918);
      setSessionId(data.id?.toString());
    } catch {
      setSessionId('3740');
    }
  };

  const startNewChat = async () => {
    setMessages([]);
    setLoading(false);
    setSessionId(null);
    startSession();
  };

  const uploadImage = async (uri: string, fileName: string, mimeType: string): Promise<string | null> => {
    try {
      const res = await fetch(`${UPLOAD_BASE}/generate-upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fileName, type: mimeType, asset_for: 'chat' }),
      });
      const { signed_url, public_url } = await res.json() as { signed_url: string; public_url: string };
      const fileRes = await fetch(uri);
      const blob = await fileRes.blob();
      await fetch(signed_url, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType, 'x-ms-blob-type': 'BlockBlob' },
        body: blob,
      });
      return public_url;
    } catch {
      return null;
    }
  };

  const handleAttach = () => {
    Alert.alert('Attach', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => launchCamera({ mediaType: 'photo', quality: 0.8 }, async (res) => {
          if (res.assets?.[0]) {
            const asset = res.assets[0];
            setPendingImage(asset.uri || null);
            const url = await uploadImage(asset.uri!, asset.fileName || 'photo.jpg', asset.type || 'image/jpeg');
            if (url) { setPendingImage(url); setInput(prev => prev || 'Analyze this report'); }
            else { setPendingImage(null); Alert.alert('Upload failed'); }
          }
        }),
      },
      {
        text: 'Gallery',
        onPress: () => launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (res) => {
          if (res.assets?.[0]) {
            const asset = res.assets[0];
            setPendingImage(asset.uri || null);
            const url = await uploadImage(asset.uri!, asset.fileName || 'photo.jpg', asset.type || 'image/jpeg');
            if (url) { setPendingImage(url); setInput(prev => prev || 'Analyze this report'); }
            else { setPendingImage(null); Alert.alert('Upload failed'); }
          }
        }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleVoiceStart = async () => {
    setVoiceText('');
    const started = await deepgramVoice.start(
      language,
      (text, isFinal) => {
        if (isFinal) {
          setVoiceText(prev => (prev ? prev + ' ' : '') + text);
        } else {
          // Show interim text
          setVoiceText(prev => {
            const parts = prev.split(' ');
            // Replace last word with interim
            return prev ? prev + ' ' + text : text;
          });
        }
      },
      (state) => setVoiceState(state),
      (finalText) => {
        // Auto-send on silence
        setVoiceState('idle');
        setVoiceText('');
        if (finalText.trim()) {
          setInput(finalText.trim());
          // Auto send after small delay
          setTimeout(() => sendMessage(finalText.trim()), 100);
        }
      },
    );
    if (!started) setVoiceState('idle');
  };

  const handleVoiceStop = () => {
    const text = deepgramVoice.stop();
    setVoiceState('idle');
    if (text) {
      setInput(text);
      setVoiceText('');
      // Auto send
      setTimeout(() => sendMessage(text), 100);
    } else {
      setVoiceText('');
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if ((!msgText && !pendingImage) || loading) return;

    setMessages(prev => prev.map(m =>
      (m.type === 'asking_permission' || m.type === 'diagnostic_question') && !m.answered
        ? { ...m, answered: true } : m
    ));

    const imageToSend = pendingImage?.startsWith('http') ? pendingImage : null;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText || '', timestamp: new Date(), imageUrl: imageToSend || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${AI_BASE}/base-chat/chats/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `session_token=${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: 5918,
          thread_id: parseInt(sessionId || '3740'),
          user_message: language === 'te'
            ? `[RESPOND IN TELUGU LANGUAGE. Keep medical terms in English within parentheses. User message]: ${msgText}`
            : msgText || 'Analyze this image',
          images: imageToSend ? [imageToSend] : [],
          documents: [],
          platform: 'mobile',
        }),
      });

      const fullText = await response.text();
      const lines = fullText.split('\n');
      let chunks: string[] = [];
      let responseType = 'chat';
      let metadata: any = null;

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) chunks.push(parsed.chunk);
            if (parsed.done && parsed.type) {
              responseType = parsed.type;
              metadata = parsed.metadata;
            }
            if (parsed.summary_meta) {
              metadata = { ...metadata, ...parsed.summary_meta };
            }
            if (parsed.summary_section && parsed.key && parsed.data) {
              if (!metadata) metadata = {};
              if (!metadata.sections) metadata.sections = {};
              metadata.sections[parsed.key] = parsed.data;
            }
          } catch {}
        }
      }

      // Streaming animation
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let accumulated = '';
      const batchSize = Math.max(1, Math.ceil(chunks.length / 40));
      for (let i = 0; i < chunks.length; i += batchSize) {
        for (let j = i; j < Math.min(i + batchSize, chunks.length); j++) {
          accumulated += chunks[j];
        }
        const current = accumulated;
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: current } : m
        ));
        if (i + batchSize < chunks.length) {
          await new Promise(r => setTimeout(r, 15));
        }
      }

      setLoading(false);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: accumulated || 'I couldn\'t generate a response.', ...(responseType !== 'chat' ? { type: responseType, metadata } : {}) }
          : m
      ));
    } catch (err) {
      console.log('Chat error:', err);
      setLoading(false);
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
        error: true,
      }]);
    }
  };

  const retryLast = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      setMessages(prev => prev.filter(m => !m.error));
      sendMessage(lastUser.content);
    }
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') return <MessageBubble content={item.content} imageUrl={item.imageUrl} />;

    if (item.error) {
      return (
        <View style={s.errorRow}>
          <AssistantMessage content={item.content} />
          <Pressable style={s.retryChip} onPress={retryLast}>
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (item.answered) return <AssistantMessage content={item.content} />;

    if (item.type === 'asking_permission') {
      return (
        <PermissionCard
          title={item.metadata?.title || 'Assessment Available'}
          content={item.content}
          onAccept={() => sendMessage('Yes')}
          onDecline={() => sendMessage('Later')}
        />
      );
    }

    if (item.type === 'diagnostic_question') {
      const format = item.metadata?.question_format;
      const config = item.metadata?.question_config;
      const qNum = item.metadata?.question_number;

      if (format === 'mcq' && config?.options) {
        return (
          <MCQCard
            question={item.content}
            options={config.options}
            multiSelect={config.multi_select}
            onSubmit={(answer) => sendMessage(answer)}
            questionNumber={qNum}
          />
        );
      }

      return (
        <TextQuestionCard
          question={item.content}
          placeholder={config?.placeholder}
          onSubmit={(answer) => sendMessage(answer)}
          questionNumber={qNum}
        />
      );
    }

    if (item.type === 'summary') {
      return (
        <SummaryCard
          severity={item.metadata?.severity}
          hypothesis={item.metadata?.top_hypothesis}
          narrative={item.metadata?.narrative}
          sections={item.metadata?.sections}
          sectionOrder={item.metadata?.section_order}
        />
      );
    }

    return <AssistantMessage content={item.content} />;
  };

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ChatHeader
        onBack={() => navigation.canGoBack() && navigation.goBack()}
        onNewChat={startNewChat}
        onMenu={() => navigation.navigate('ChatHistory')}
      />
      {isEmpty && !loading ? (
        <QuickActions
          onSelect={handleQuickAction}
          language={language}
          onLanguageChange={(l) => setLanguage(l as 'en' | 'te')}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={s.messageList}
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />
      )}
      {pendingImage && (
        <View style={s.previewRow}>
          <Image source={{ uri: pendingImage }} style={s.previewImg} />
          <Pressable onPress={() => setPendingImage(null)} style={s.previewClose}>
            <Icon name="X" size={14} color={colors.textInverse} weight="bold" />
          </Pressable>
        </View>
      )}
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={() => sendMessage()}
        onAttach={handleAttach}
        onVoiceStart={handleVoiceStart}
        onVoiceStop={handleVoiceStop}
        voiceState={voiceState}
        voiceText={voiceText}
        disabled={loading}
      />
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  messageList: { paddingTop: 20, paddingBottom: 12, flexGrow: 1 },
  errorRow: { marginBottom: 8 },
  retryChip: {
    alignSelf: 'flex-start',
    marginLeft: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  retryText: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.coral },
  previewRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  previewImg: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.surfaceSunken },
  previewClose: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', marginLeft: -12, marginTop: -44 },
});
