module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ['react-native-unistyles/plugin', { root: 'src' }],
      'react-native-worklets/plugin',
    ],
  };
};
