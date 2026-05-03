import { StyleSheet } from 'react-native-unistyles';
import { darkTheme } from './themes/dark';

StyleSheet.configure({
  themes: {
    dark: darkTheme,
  },
  settings: {
    initialTheme: 'dark',
    adaptiveThemes: false,
  },
});

export type { AppTheme } from './themes/dark';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: typeof darkTheme;
  }
}
