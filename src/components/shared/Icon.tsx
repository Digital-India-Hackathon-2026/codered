import React, { memo } from 'react';
import * as Phosphor from 'phosphor-react-native';
import { colors } from '../../theme';

type IconWeight = 'regular' | 'bold' | 'fill' | 'duotone' | 'thin' | 'light';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  weight?: IconWeight;
  state?: string;
}

const stateColors: Record<string, string> = {
  active: colors.coral,
  success: colors.sage,
  warning: colors.amber,
  danger: colors.danger,
  default: colors.textSecondary,
};

export const Icon: React.FC<IconProps> = memo(({ name, size = 24, color, weight = 'duotone', state }) => {
  const resolvedColor = color || (state ? stateColors[state] || stateColors.default : colors.textSecondary);
  // Support both PascalCase (Phosphor) and kebab-case (legacy Feather)
  const pascalName = name.includes('-')
    ? name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
    : name.charAt(0).toUpperCase() + name.slice(1);

  const IconComponent = (Phosphor as any)[pascalName] as React.ComponentType<{
    size: number;
    color: string;
    weight: IconWeight;
  }> | undefined;

  if (!IconComponent) return null;

  return <IconComponent size={size} color={resolvedColor} weight={weight} />;
});
