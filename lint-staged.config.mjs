export default {
  'content/**/*.md': ['node scripts/check-image-alternatives.mts'],
  '*.{js,jsx,mjs,cjs,ts,tsx,mts}': ['eslint --fix --no-warn-ignored --max-warnings 0'],
  '*.{json,jsonc,md,yml,yaml,css}': ['prettier --write --ignore-unknown'],
};
