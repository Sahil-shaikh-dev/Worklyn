import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { styles } from './styles';

export type ButtonVariant =
  | 'primary'
  | 'primaryOutline'
  | 'secondary'
  | 'destructive';

export type ButtonSize = 'sm' | 'md';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: ReactNode;
  /** Merged after base button styles (static styles only; no press callback). */
  style?: StyleProp<ViewStyle>;
};

function surfaceStyle(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return styles.primary;
    case 'primaryOutline':
      return styles.primaryOutline;
    case 'secondary':
      return styles.secondary;
    case 'destructive':
      return styles.destructive;
    default:
      return styles.primary;
  }
}

function labelStyle(variant: ButtonVariant, size: ButtonSize) {
  const base = size === 'sm' ? styles.labelSm : styles.label;
  switch (variant) {
    case 'primary':
      return [base, styles.labelPrimary];
    case 'primaryOutline':
      return [base, styles.labelPrimaryOutline];
    case 'secondary':
      return [base, styles.labelSecondary];
    case 'destructive':
      return [base, styles.labelDestructive];
    default:
      return [base, styles.labelPrimary];
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const rootSize = size === 'sm' ? styles.rootSm : styles.rootMd;

  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text style={[...labelStyle(variant, size)]}>{children}</Text>
    ) : (
      children
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        rootSize,
        surfaceStyle(variant),
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      {content}
    </Pressable>
  );
}
