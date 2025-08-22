const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: getDefaultConfig(__dirname).resolver.assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...getDefaultConfig(__dirname).resolver.sourceExts, 'svg'],
    },
  }
);
