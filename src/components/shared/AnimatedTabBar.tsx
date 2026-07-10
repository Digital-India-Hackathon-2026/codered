import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

interface Tab {
  key: string;
  label: string;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = memo(({
  tabs, activeKey, onTabPress,
}) => (
  <View style={styles.container}>
    {tabs.map(tab => (
      <Pressable
        key={tab.key}
        style={[styles.tab, activeKey === tab.key && styles.tabActive]}
        onPress={() => onTabPress(tab.key)}
      >
        <Text style={[styles.label, activeKey === tab.key && styles.labelActive]}>
          {tab.label}
        </Text>
      </Pressable>
    ))}
  </View>
));

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: radius.sm,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
