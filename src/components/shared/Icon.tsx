import React, { memo } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme';

type IconState = 'default' | 'active' | 'success' | 'warning' | 'danger';

interface IconProps {
  name: string;
  size?: number;
  state?: IconState;
  color?: string;
}

const stateColorMap: Record<IconState, string> = {
  default: colors.textSecondary,
  active: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export const Icon: React.FC<IconProps> = memo(({ name, size = 20, state = 'default', color }) => (
  <FeatherIcon
    name={name}
    size={size}
    color={color || stateColorMap[state]}
  />
));
