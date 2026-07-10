import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/UI';
import { healthProfileAPI, dataAPI } from '../../api/services';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    healthProfileAPI.get().then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  const handleExport = async () => {
    try {
      await dataAPI.export();
      Alert.alert('Export Started', 'Your health data export will be emailed to you.');
    } catch { Alert.alert('Error', 'Could not export data'); }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete all your data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await dataAPI.deleteAll(); await logout(); } catch {}
      }},
    ]);
  };

  const menuItems = [
    { icon: '👤', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: '🏥', label: 'Health Profile', onPress: () => navigation.navigate('HealthProfile') },
    { icon: '👨‍👩‍👧', label: 'Family History', onPress: () => navigation.navigate('FamilyHistory') },
    { icon: '🍎', label: 'Lifestyle', onPress: () => navigation.navigate('Lifestyle') },
    { icon: '⚠️', label: 'Allergies', onPress: () => navigation.navigate('Allergies') },
    { icon: '📤', label: 'Share Health Summary', onPress: () => navigation.navigate('ShareSummary') },
    { icon: '📥', label: 'Export My Data', onPress: handleExport },
    { icon: '🔔', label: 'Notification Settings', onPress: () => navigation.navigate('NotificationSettings') },
    { icon: '🔒', label: 'Privacy & Consent', onPress: () => navigation.navigate('Privacy') },
    { icon: '📋', label: 'Audit Log', onPress: () => navigation.navigate('AuditLog') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{user?.name?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email || user?.phone}</Text>
        {profile && (
          <View style={styles.profileStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.age || '—'}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.blood_group || '—'}</Text>
              <Text style={styles.statLabel}>Blood</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.conditions?.length || 0}</Text>
              <Text style={styles.statLabel}>Conditions</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Menu */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Danger Zone */}
      <Card style={styles.dangerCard}>
        <Button title="Logout" variant="outline" onPress={logout} style={{ marginBottom: spacing.md }} />
        <Button title="Delete Account & All Data" variant="ghost" onPress={handleDeleteAccount} style={{ borderColor: colors.danger }} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  profileCard: { alignItems: 'center', padding: spacing.xxl },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  avatarLargeText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  userName: { ...typography.h2, color: colors.text },
  userEmail: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  profileStats: { flexDirection: 'row', marginTop: spacing.xl, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  menuCard: { marginTop: spacing.lg, padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: { fontSize: 20, marginRight: spacing.md },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  menuArrow: { fontSize: 22, color: colors.textTertiary },
  dangerCard: { marginTop: spacing.lg },
});
