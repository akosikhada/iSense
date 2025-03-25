const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Get the default Expo configuration
const defaultConfig = getDefaultConfig(__dirname);

// Create a clean config object
const config = {
  ...defaultConfig,
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, "app"),
    path.resolve(__dirname, "node_modules"),
  ],
  maxWorkers: 2,
  resolver: {
    ...defaultConfig.resolver,
    nodeModulesPaths: [path.resolve(__dirname, "node_modules")],
  },
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ["expo-asset/tools/hashAssetFiles"],
  },
};

// Apply NativeWind
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./global.css" });
