import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';

export default () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
    postcssNested,
  ],
});
