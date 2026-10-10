import postcssNested from 'postcss-nested';
import tailwindcss from '@tailwindcss/postcss';

export default () => ({
  // Flatten component nesting before Gatsby's CSS Module selector processing.
  // Tailwind owns imports, prefixing and modern syntax for its utility output.
  plugins: [postcssNested, tailwindcss],
});
