import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Vibration } from 'react-native';
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: string;
  metadata?: any;
  answered?: boolean;
}

const AI_BASE = 'https://askfirst.co/api/ai';

export const ChatScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { startSession(); }, []);

  const startSession = async () => {
    try {
      const { data } = await chatAPI.createThread(5918);
      setSessionId(data.id?.toString());
    } catch {
      setSessionId('default');
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    Vibration.vibrate(10);

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
          user_message: msgText,
          images: [],
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
          } catch {}
        }
      }

      const fullResponse = chunks.join('');
      setLoading(false);

      Vibration.vibrate(20);

      const newMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        ...(responseType !== 'chat' ? { type: responseType, metadata } : {}),
      };
      setMessages(prev => [...prev, newMsg]);
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, {
        id: aiMsgId, role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') return <MessageBubble content={item.content} />;
    if (item.answered) return <AssistantMessage content={item.content} />;

    if (item.type === 'asking_permission') {
      return (
        <PermissionCard
          title={item.metadata?.title || "Assessment Available"}
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader
        onBack={() => navigation.canGoBack() && navigation.goBack()}
        onMenu={() => navigation.navigate('ChatHistory')}
      />
      {isEmpty && !loading ? (
        <QuickActions onSelect={handleQuickAction} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
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

import { colors, spacing } from '../../theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  messageList: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
});
