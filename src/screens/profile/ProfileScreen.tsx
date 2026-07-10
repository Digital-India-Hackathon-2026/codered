import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/UI';
import { Icon } from '../../components/shared';
import { healthProfileAPI, dataAPI } from '../../api/services';
import { colors, spacing, typography, radius } from '../../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    healthProfileAPI.get().then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  const handleExport = async () => {
    try { await dataAPI.export(); Alert.alert('Export Started', 'Your data export will be emailed.'); }
    catch { Alert.alert('Error', 'Could not export data'); }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete all your data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await dataAPI.deleteAll(); await logout(); } catch {}
      }},
    ]);
  };

  const menuItems = [
    { icon: 'user', label: 'Edit Profile' },
    { icon: 'heart', label: 'Health Profile' },
    { icon: 'users', label: 'Family History' },
    { icon: 'sun', label: 'Lifestyle' },
    { icon: 'alert-circle', label: 'Allergies' },
    { icon: 'share-2', label: 'Share Health Summary' },
    { icon: 'download', label: 'Export My Data', onPress: handleExport },
    { icon: 'bell', label: 'Notifications' },
    { icon: 'lock', label: 'Privacy & Consent' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Profile Header */}
      <View style={s.profileCard}>
        <View style={s.avatarLarge}>
          <Text style={s.avatarText}>{user?.name?.[0] || user?.username?.[0] || 'U'}</Text>
        </View>
        <Text style={s.userName}>{user?.name || user?.username}</Text>
        <Text style={s.userEmail}>{user?.email || user?.phone}</Text>
        {profile && (
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{profile.age || '—'}</Text>
              <Text style={s.statLabel}>Age</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{profile.blood_group || '—'}</Text>
              <Text style={s.statLabel}>Blood</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>{profile.conditions?.length || 0}</Text>
              <Text style={s.statLabel}>Conditions</Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {menuItems.map((item, i) => (
          <Pressable
            key={i}
            style={[s.menuItem, i < menuItems.length - 1 && s.menuItemBorder]}
            onPress={item.onPress}
          >
            <Icon name={item.icon} size={18} color={colors.textSecondary} />
            <Text style={s.menuLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      {/* Actions */}
      <View style={s.dangerSection}>
        <Button title="Logout" variant="outline" onPress={logout} style={{ marginBottom: spacing.sm }} />
        <Pressable style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={s.deleteText}>Delete account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: 100 },

  profileCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  avatarLarge: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#F4F4F5',
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  avatarText: { fontSize: 24, fontWeight: '600', color: colors.textSecondary },
  userName: { ...typography.sectionTitle, color: colors.text },
  userEmail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', marginTop: spacing.xl, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { ...typography.cardTitle, color: colors.text, fontWeight: '600' },
  statLabel: { ...typography.meta, color: colors.textTertiary },
  statDivider: { width: 1, height: 24, backgroundColor: colors.border },

  menuCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },

  dangerSection: { marginTop: spacing.sm },
  deleteBtn: { alignItems: 'center', paddingVertical: spacing.md },
  deleteText: { ...typography.caption, color: colors.danger },
});
