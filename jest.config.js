module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: [
    'react-native-unistyles/mocks',
    '<rootDir>/jest/setupAfterEnv.js',
  ],
  /** ESM packages used by React Navigation — transpile like react-native. */
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|@react-navigation|react-native-screens|react-native-gesture-handler)',
  ],
};
