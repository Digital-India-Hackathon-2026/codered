import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatHeader,
  MessageBubble,
  AssistantMessage,
  TypingIndicator,
  ChatInput,
} from '../../components/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AI_BASE = 'https://askfirst.co/api/ai';

export const ChatThreadScreen = ({ navigation, route }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const threadId = route?.params?.threadId;

  useEffect(() => {
    if (threadId) loadThreadMessages(threadId);
  }, [threadId]);

  const loadThreadMessages = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${AI_BASE}/chats?thread_id=${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `session_token=${token}` } : {}),
        },
      });
      const data = await res.json();
      const msgs: Message[] = (data.messages || [])
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((m: any) => ({
          id: m.id.toString(),
          role: m.role as 'user' | 'assistant',
          content: m.content || '',
          timestamp: new Date(m.created_at),
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Cookie: `session_token=${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: 5918,
          thread_id: threadId,
          user_message: msgText,
          images: [],
          documents: [],
          platform: 'mobile',
        }),
      });

      const fullText = await response.text();
      const lines = fullText.split('\n');
      let chunks: string[] = [];

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) chunks.push(parsed.chunk);
          } catch {}
        }
      }

      const fullResponse = chunks.join('');
      const words = fullResponse.split(/(\s+)/);
      let accumulated = '';

      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() }]);
      setLoading(false);

      for (let i = 0; i < words.length; i++) {
        accumulated += words[i];
        const current = accumulated;
        await new Promise(resolve => setTimeout(resolve, 20));
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: current } : m)
        );
      }
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return <MessageBubble content={item.content} />;
    }
    return <AssistantMessage content={item.content} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader
        onBack={() => navigation.goBack()}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={sendMessage}
        disabled={loading}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
});
