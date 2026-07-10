import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, spacing, typography, borderRadius } from '../../theme';

export const LoginScreen = ({ navigation }: any) => {
  const { login, loginWithOtp } = useAuth();
  const [mode, setMode] = useState<'email' | 'phone'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'email') {
        await login(email, password);
      } else {
        const formattedPhone = phone.replace('+', '').replace(/\s/g, '');
        const phoneWithCode = formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`;
        await loginWithOtp(phoneWithCode);
        navigation.navigate('OtpVerify', { phone: phoneWithCode });
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🔬</Text>
          <Text style={styles.title}>LifeLens</Text>
          <Text style={styles.subtitle}>Your Intelligent Health Timeline</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.modeToggle}>
            <Button
              title="📱 Phone"
              variant={mode === 'phone' ? 'primary' : 'ghost'}
              onPress={() => setMode('phone')}
              style={styles.toggleBtn}
            />
            <Button
              title="✉️ Email"
              variant={mode === 'email' ? 'primary' : 'ghost'}
              onPress={() => setMode('email')}
              style={styles.toggleBtn}
            />
          </View>

          {mode === 'phone' ? (
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          ) : (
            <>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={mode === 'phone' ? 'Send OTP' : 'Login'} onPress={handleLogin} loading={loading} />

          <Button
            title="Create Account"
            variant="outline"
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  logo: { fontSize: 56, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.primary, fontSize: 32 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  form: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl },
  modeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  toggleBtn: { flex: 1, height: 44 },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
