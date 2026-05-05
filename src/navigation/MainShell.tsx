import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Calendar,
  History as HistoryIcon,
  Home as HomeIcon,
} from 'lucide-react-native';
import { View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeaderBar } from '../components/layout';
import { DisplayNameModal } from '../components/ui';
import HomeScreen from '../pages/Home';
import HistoryScreen from '../pages/History';
import LeavesScreen from '../pages/Leaves';
import { styles } from './MainShell/styles';
import type { RootTabParamList } from './types';
import { useMainShellProfileHeader } from './useMainShellProfileHeader';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabBarIconProps = Readonly<{
  color: string;
  focused: boolean;
  size: number;
}>;

function HomeTabBarIcon({ color, size }: TabBarIconProps) {
  return <HomeIcon color={color} size={size} />;
}

function HistoryTabBarIcon({ color, size }: TabBarIconProps) {
  return <HistoryIcon color={color} size={size} />;
}

function LeavesTabBarIcon({ color, size }: TabBarIconProps) {
  return <Calendar color={color} size={size} />;
}

export function MainShell() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const shell = useMainShellProfileHeader();

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <DisplayNameModal
        initialName={shell.nameModalSeed}
        mode={shell.nameModalMode}
        onRequestDismiss={shell.onDismissNameModal}
        onSave={shell.onSaveDisplayName}
        visible={shell.nameModalVisible}
      />
      <AppHeaderBar
        avatarInitial={shell.avatarInitial}
        greeting={shell.headerGreeting}
        onAvatarLongPress={shell.onAvatarLongPress}
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        }}
      >
        <Tab.Screen
          component={HomeScreen}
          name="Home"
          options={{
            tabBarIcon: HomeTabBarIcon,
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          component={HistoryScreen}
          name="History"
          options={{
            tabBarIcon: HistoryTabBarIcon,
            tabBarLabel: 'History',
          }}
        />
        <Tab.Screen
          component={LeavesScreen}
          name="Leaves"
          options={{
            tabBarIcon: LeavesTabBarIcon,
            tabBarLabel: 'Leaves',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
