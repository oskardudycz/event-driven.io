import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import postcssEasyMediaQuery from 'postcss-easy-media-query';

export default () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
    postcssEasyMediaQuery({
      breakpoints: {
        tablet: 600,
        desktop: 1024,
      },
    }),
    postcssNested,
  ],
});
