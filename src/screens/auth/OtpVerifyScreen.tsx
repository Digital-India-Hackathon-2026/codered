import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, spacing, typography, radius } from '../../theme';

export const OtpVerifyScreen = ({ route }: any) => {
  const { verifyOtp } = useAuth();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    try { await verifyOtp(phone, otp); }
    catch (e: any) { setError(e.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Verify OTP</Text>
      <Text style={s.subtitle}>Enter the code sent to {phone}</Text>
      <View style={s.form}>
        <Input label="OTP Code" placeholder="123456" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <Button title="Verify" onPress={handleVerify} loading={loading} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.screenTitle, textAlign: 'center', color: colors.text },
  subtitle: { ...typography.caption, textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.xl },
  form: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  error: { ...typography.meta, color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
