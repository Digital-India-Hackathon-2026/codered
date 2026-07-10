import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../../components/shared/Icon';
import { StaggeredListItem } from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, fonts } from '../../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userId');
    logout();
  };

  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <StaggeredListItem index={0}>
          <Text style={s.h1}>Profile</Text>
        </StaggeredListItem>

        {/* User Card */}
        <StaggeredListItem index={1}>
          <View style={s.userCard}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user?.name || user?.username || 'User'}</Text>
              <Text style={s.userEmail}>{user?.email || user?.phone || ''}</Text>
            </View>
          </View>
        </StaggeredListItem>

        {/* Quick Actions */}
        <StaggeredListItem index={2}>
          <Text style={s.sectionTitle}>Health</Text>
          <MenuItem
            icon="Pill"
            iconColor={colors.amber}
            tint="#FEF3C7"
            label="Medications"
            subtitle="Coming soon"
          />
          <MenuItem
            icon="FileText"
            iconColor={colors.coral}
            tint={colors.coralSoft}
            label="Reports"
            subtitle="Coming soon"
          />
          <MenuItem
            icon="Heartbeat"
            iconColor={colors.sage}
            tint="#D1FAE5"
            label="Health Connect"
            subtitle="Manage connected data sources"
            onPress={() => Linking.openURL('content://com.google.android.apps.healthdata').catch(() => {})}
          />
        </StaggeredListItem>

        {/* App */}
        <StaggeredListItem index={3}>
          <Text style={s.sectionTitle}>App</Text>
          <MenuItem
            icon="ChatCircle"
            iconColor="#3B82F6"
            tint="#EEF4FF"
            label="Chat History"
            onPress={() => navigation.navigate('ChatHistory')}
          />
          <MenuItem
            icon="Info"
            iconColor={colors.textSecondary}
            tint={colors.surfaceSunken}
            label="About LifeLens"
            subtitle="v1.0.0 · CodeRed Hackathon 2026"
          />
        </StaggeredListItem>

        {/* Sign Out */}
        <StaggeredListItem index={4}>
          <Pressable style={s.signOutBtn} onPress={handleSignOut}>
            <Icon name="SignOut" size={18} color={colors.coral} weight="regular" />
            <Text style={s.signOutText}>Sign out</Text>
          </Pressable>
        </StaggeredListItem>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, iconColor, tint, label, subtitle, onPress }: {
  icon: string; iconColor: string; tint: string; label: string; subtitle?: string; onPress?: () => void;
}) => (
  <Pressable style={s.menuCard} onPress={onPress}>
    <View style={[s.iconBox, { backgroundColor: tint }]}>
      <Icon name={icon} size={17} color={iconColor} weight="fill" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.menuLabel}>{label}</Text>
      {subtitle && <Text style={s.menuSub}>{subtitle}</Text>}
    </View>
    {onPress && <Icon name="CaretRight" size={14} color={colors.textTertiary} weight="regular" />}
  </Pressable>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12 },

  h1: { fontFamily: fonts.fraunces.semiBold, fontSize: 28, lineHeight: 34, color: colors.text, marginBottom: 20 },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.textInverse },
  userName: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  userEmail: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary, marginTop: 2 },

  // Section
  sectionTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 12, letterSpacing: 0.5, color: colors.textTertiary, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },

  // Menu
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: { width: 34, height: 34, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { fontFamily: fonts.generalSans.medium, fontSize: 14, color: colors.text },
  menuSub: { fontFamily: fonts.generalSans.regular, fontSize: 11, color: colors.textTertiary, marginTop: 1 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    height: 46,
    gap: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  signOutText: { fontFamily: fonts.generalSans.medium, fontSize: 14, color: colors.coral },
});
