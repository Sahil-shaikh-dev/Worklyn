import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import { styles } from './styles';

export type ChipVariant = 'muted' | 'outline';
export type ChipSize = 'sm' | 'md';

export type ChipProps = Omit<ViewProps, 'children'> & {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  /** When set, chip is pressable with feedback */
  onPress?: () => void;
};

export function Chip({
  children,
  variant = 'muted',
  size = 'md',
  disabled = false,
  onPress,
  style,
  ...rest
}: ChipProps) {
  const rootSize = size === 'sm' ? styles.rootSm : styles.rootMd;
  const surface = variant === 'outline' ? styles.outline : styles.muted;
  const labelSize = size === 'sm' ? styles.labelSm : styles.label;
  const labelColor =
    variant === 'outline' ? styles.labelOutline : styles.labelMuted;

  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text style={[labelSize, labelColor]}>{children}</Text>
    ) : (
      children
    );

  if (onPress != null) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
          styles.root,
          rootSize,
          surface,
          style,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
        {...rest}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.root, rootSize, surface, style]} {...rest}>
      {content}
    </View>
  );
}
