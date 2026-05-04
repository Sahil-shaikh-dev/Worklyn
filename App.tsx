/**
 * @format
 */

import './src/theme/configure';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AttendanceSessionProvider } from './src/features/attendance';
import { UserProfileProvider } from './src/features/userProfile';
import { RootNavigator } from './src/navigation';

function App() {
  return (
    <SafeAreaProvider>
      <UserProfileProvider>
        <AttendanceSessionProvider>
          <StatusBar barStyle="light-content" />
          <RootNavigator />
        </AttendanceSessionProvider>
      </UserProfileProvider>
    </SafeAreaProvider>
  );
}

export default App;
