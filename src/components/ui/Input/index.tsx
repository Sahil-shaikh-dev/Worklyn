import { forwardRef, useCallback, useState } from 'react';
import {
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { styles } from './styles';

export type InputSize = 'sm' | 'md';

export type InputProps = Omit<TextInputProps, 'style'> & {
  size?: InputSize;
  /** Shows destructive border (e.g. validation); overrides focus primary until cleared */
  error?: boolean;
  disabled?: boolean;
  /** Merged after base styles (e.g. multiline textarea height). */
  style?: StyleProp<TextStyle>;
};

const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    size = 'md',
    error = false,
    disabled = false,
    editable,
    onFocus,
    onBlur,
    placeholderTextColor,
    style,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const { theme } = useUnistyles();

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    e => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    e => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const isEditable = disabled ? false : (editable ?? true);
  const showFocusRing = focused && !error;

  return (
    <TextInput
      ref={ref}
      style={[
        styles.base,
        size === 'sm' && styles.baseSm,
        showFocusRing && styles.focused,
        error && styles.error,
        disabled && styles.disabled,
        style,
      ]}
      editable={isEditable}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholderTextColor={
        placeholderTextColor ?? theme.colors.mutedForeground
      }
      underlineColorAndroid="transparent"
      {...rest}
    />
  );
});

export { Input };
