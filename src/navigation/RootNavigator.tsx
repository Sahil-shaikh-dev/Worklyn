import { NavigationContainer } from '@react-navigation/native';
import { MainShell } from './MainShell';

export function RootNavigator() {
  return (
    <NavigationContainer>
      <MainShell />
    </NavigationContainer>
  );
}
