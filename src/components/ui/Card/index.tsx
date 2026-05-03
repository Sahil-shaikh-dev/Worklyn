import { Text, View, type ViewProps } from 'react-native';
import { styles } from './styles';

export type CardProps = ViewProps & {
  /** Optional heading — uses cardForeground typography */
  title?: string;
  /** Optional supporting line — uses muted foreground */
  description?: string;
};

export function Card({
  title,
  description,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {title != null && title !== '' ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      {description != null && description !== '' ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}
