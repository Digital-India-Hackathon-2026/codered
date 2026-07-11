import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, fonts } from '../../theme';
import {
  ChatHeader, MessageBubble, AssistantMessage, TypingIndicator, ChatInput,
  PermissionCard, MCQCard, TextQuestionCard, SummaryCard,
} from '../../components/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: string;
  metadata?: any;
  answered?: boolean;
  streaming?: boolean;
}

const AI_BASE = 'https://askfirst.co/api/ai';

export const ChatThreadScreen = ({ navigation, route }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const threadId = route?.params?.threadId;

  useEffect(() => { if (threadId) loadThreadMessages(threadId); }, [threadId]);

  const loadThreadMessages = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${AI_BASE}/chats?thread_id=${id}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data: any = await res.json();
      const msgs: Message[] = (data.messages || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          id: m.id.toString(),
          role: m.role as 'user' | 'assistant',
          content: m.content || '',
          timestamp: new Date(m.created_at),
          type: m.type || undefined,
          metadata: m.metadata || undefined,
          answered: true,
        }));
      setMessages(msgs);
    } catch {}
  };

  const sendMessage = async () => {
    const msgText = input.trim();
    if (!msgText || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${AI_BASE}/base-chat/chats/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ user_id: 5918, thread_id: threadId, user_message: msgText, images: [], documents: [], platform: 'mobile' }),
      });

      // Create streaming placeholder
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date(), streaming: true }]);

      const fullText = await response.text();
      const lines = fullText.split('\n');
      let chunks: string[] = [];
      let responseType = 'chat';
      let metadata: any = null;
      let accumulated = '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) chunks.push(parsed.chunk);
            if (parsed.done && parsed.type) { responseType = parsed.type; metadata = parsed.metadata; }
          } catch {}
        }
      }

      // Stream tokens visually
      for (let i = 0; i < chunks.length; i++) {
        accumulated += chunks[i];
        const current = accumulated;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: current } : m));
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 30));
      }

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
        return [...filtered, { id: aiMsgId, role: 'assistant', content: 'Something went wrong.', timestamp: new Date() }];
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') return <MessageBubble content={item.content} />;

    if (item.type === 'summary' && item.metadata) {
      return <SummaryCard severity={item.metadata?.severity} hypothesis={item.metadata?.top_hypothesis} narrative={item.metadata?.narrative} sections={item.metadata?.sections} sectionOrder={item.metadata?.section_order} />;
    }
    if (item.type === 'asking_permission' && !item.answered) {
      return <PermissionCard title={item.metadata?.title || 'Assessment'} content={item.content} onAccept={() => {}} onDecline={() => {}} />;
    }
    if (item.type === 'diagnostic_question' && !item.answered) {
      const format = item.metadata?.question_format;
      const config = item.metadata?.question_config;
      if (format === 'mcq' && config?.options) return <MCQCard question={item.content} options={config.options} multiSelect={config.multi_select} onSubmit={() => {}} questionNumber={item.metadata?.question_number} />;
      return <TextQuestionCard question={item.content} placeholder={config?.placeholder} onSubmit={() => {}} questionNumber={item.metadata?.question_number} />;
    }

    return <AssistantMessage content={item.content} streaming={item.streaming} />;
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ChatHeader onBack={() => navigation.goBack()} />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={loading && !messages.some(m => m.streaming) ? <TypingIndicator /> : null}
      />
      <ChatInput value={input} onChangeText={setInput} onSend={sendMessage} disabled={loading} />
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingTop: 16, paddingBottom: 8 },
});
