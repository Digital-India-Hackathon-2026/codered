import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: string;
  metadata?: any;
  answered?: boolean;
  error?: boolean;
  streaming?: boolean;
}

const AI_BASE = 'https://askfirst.co/api/ai';

export const ChatScreen = ({ navigation, route }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { startSession(); }, []);

  // Handle prefill from Vitals screen
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
      setSessionId('default');
    }
  };

  const startNewChat = async () => {
    setMessages([]);
    setLoading(false);
    setSessionId(null);
    startSession();
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    setMessages(prev => prev.map(m =>
      (m.type === 'asking_permission' || m.type === 'diagnostic_question') && !m.answered
        ? { ...m, answered: true } : m
    ));

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
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
            : msgText,
          images: [],
          documents: [],
          platform: 'mobile',
        }),
      });

      // Create streaming message placeholder
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      }]);

      const fullText = await response.text();
      const lines = fullText.split('\n');
      let accumulated = '';
      let responseType = 'chat';
      let metadata: any = null;

      // Simulate streaming by revealing chunks with delays
      const chunks: string[] = [];
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) chunks.push(parsed.chunk);
            if (parsed.done && parsed.type) {
              responseType = parsed.type;
              metadata = parsed.metadata;
            }
          } catch {}
        }
      }

      // Stream tokens visually - fast batched reveal
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
          await new Promise(r => setTimeout(r, 12));
        }
      }

      // Finalize message
      setLoading(false);

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: accumulated || 'I couldn\'t generate a response.', streaming: false, ...(responseType !== 'chat' ? { type: responseType, metadata } : {}) }
          : m
      ));
    } catch {
      setLoading(false);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== aiMsgId);
        return [...filtered, {
          id: aiMsgId,
          role: 'assistant',
          content: 'Something went wrong.',
          timestamp: new Date(),
          error: true,
        }];
      });
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
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') return <MessageBubble content={item.content} />;

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

    return <AssistantMessage content={item.content} streaming={item.streaming} />;
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={loading && !messages.some(m => m.streaming) ? <TypingIndicator /> : null}
        />
      )}
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={() => sendMessage()}
        disabled={loading}
      />
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  messageList: { paddingTop: 16, paddingBottom: 8 },
  errorRow: { marginBottom: 8 },
  retryChip: {
    alignSelf: 'flex-start',
    marginLeft: 52,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.coral },
});


