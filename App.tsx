/**
 * @format
 */

import './src/theme/configure';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AttendanceSessionProvider } from './src/features/attendance';
import { UserProfileProvider } from './src/features/userProfile';
import Home from './src/pages/Home';

function App() {
  return (
    <SafeAreaProvider>
      <UserProfileProvider>
        <AttendanceSessionProvider>
          <StatusBar barStyle="light-content" />
          <Home />
        </AttendanceSessionProvider>
      </UserProfileProvider>
    </SafeAreaProvider>
  );
}

export default App;
