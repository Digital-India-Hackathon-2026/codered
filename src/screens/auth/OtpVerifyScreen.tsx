import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, spacing, typography, borderRadius } from '../../theme';

export const OtpVerifyScreen = ({ route }: any) => {
  const { verifyOtp } = useAuth();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>
      <View style={styles.form}>
        <Input
          label="OTP Code"
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Verify" onPress={handleVerify} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.xxl },
  title: { ...typography.h1, textAlign: 'center', color: colors.text },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.xxl },
  form: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
