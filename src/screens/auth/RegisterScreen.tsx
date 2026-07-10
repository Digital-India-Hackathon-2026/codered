import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, spacing, typography, radius } from '../../theme';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !password || (!email && !phone)) { setError('Please fill all required fields'); return; }
    setError('');
    setLoading(true);
    try { await register({ name, email: email || undefined, phone: phone || undefined, password }); }
    catch (e: any) { setError(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Start your health journey</Text>

        <View style={s.form}>
          <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
          <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" placeholder="+91 98765 43210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Password" placeholder="Min 8 characters" value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button title="Sign Up" onPress={handleRegister} loading={loading} />
          <Button title="Already have an account? Login" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.screenTitle, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  form: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  error: { ...typography.meta, color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
