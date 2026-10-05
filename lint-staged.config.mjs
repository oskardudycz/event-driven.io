export default {
  '*.{js,jsx,mjs,cjs,ts,tsx}': ['eslint --fix --no-warn-ignored --max-warnings 0'],
  '*.{json,jsonc,md,yml,yaml,css}': ['prettier --write --ignore-unknown'],
};
