module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: [
    'react-native-unistyles/mocks',
    '<rootDir>/jest/setupAfterEnv.js',
  ],
};
