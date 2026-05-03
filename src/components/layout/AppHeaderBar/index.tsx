import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

export type AppHeaderBarProps = Readonly<{
  /** Primary line next to the avatar (e.g. time-of-day greeting + name). */
  greeting: string;
  avatarInitial?: string;
  /** When set, a long press on the avatar runs this (e.g. edit display name). */
  onAvatarLongPress?: () => void;
}>;

export function AppHeaderBar({
  greeting,
  avatarInitial = 'A',
  onAvatarLongPress,
}: AppHeaderBarProps) {
  const avatarInner = <Text style={styles.avatarText}>{avatarInitial}</Text>;

  return (
    <View style={styles.shell}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {onAvatarLongPress ? (
            <Pressable
              accessibilityHint="Opens edit name"
              accessibilityLabel="Profile"
              accessibilityRole="button"
              delayLongPress={450}
              hitSlop={8}
              onLongPress={onAvatarLongPress}
              style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
              {avatarInner}
            </Pressable>
          ) : (
            <View style={styles.avatar}>{avatarInner}</View>
          )}
          <Text style={styles.greeting} numberOfLines={1}>
            {greeting}
          </Text>
        </View>
      </View>
    </View>
  );
}
