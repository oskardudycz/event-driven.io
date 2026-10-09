// Gatsby 5 discovers native ESM hooks through .mjs; Node 24 loads their TypeScript implementation.
export {
  onCreateNode,
  createPages,
  onCreatePage,
  onCreateWebpackConfig,
  onPreBuild,
  createSchemaCustomization,
  onPostBuild,
  onPostBootstrap,
} from './site/node.ts';
