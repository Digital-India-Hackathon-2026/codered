import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, spacing, typography, radius } from '../../theme';

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
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.logo}>LifeLens</Text>
          <Text style={s.subtitle}>Your health companion</Text>
        </View>

        <View style={s.form}>
          <View style={s.modeToggle}>
            <Button title="Phone" variant={mode === 'phone' ? 'primary' : 'secondary'} onPress={() => setMode('phone')} style={s.toggleBtn} />
            <Button title="Email" variant={mode === 'email' ? 'primary' : 'secondary'} onPress={() => setMode('email')} style={s.toggleBtn} />
          </View>

          {mode === 'phone' ? (
            <Input label="Phone Number" placeholder="+91 98765 43210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          ) : (
            <>
              <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            </>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button title={mode === 'phone' ? 'Send OTP' : 'Login'} onPress={handleLogin} loading={loading} />
          <Button title="Create Account" variant="ghost" onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  logo: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  form: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  modeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  toggleBtn: { flex: 1, height: 40 },
  error: { ...typography.meta, color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
