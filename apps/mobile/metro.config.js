const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch the workspace root (so edits to packages/* hot
// reload) and resolve node_modules from both this app and the root.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Packages are consumed as TS source (no build step) — make sure Metro
// resolves .ts/.tsx from workspace packages the same as app code.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'].filter(
  (ext, i, arr) => arr.indexOf(ext) === i
);
config.resolver.disableHierarchicalLookup = false;

// expo-sqlite's web backend (wa-sqlite compiled to WASM) imports its
// module as a static asset — Metro's default assetExts doesn't include
// .wasm, so without this the web bundle fails to resolve it.
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
