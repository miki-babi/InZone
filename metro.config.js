const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// add .sql support
config.resolver.sourceExts.push("sql");

// wrap with NativeWind
module.exports = withNativeWind(config, {
  input: "./global.css",
});
