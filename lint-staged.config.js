export default {
  '*.{js,json,ts,md}': 'biome format --fix --no-errors-on-unmatched',
  '*.{js,ts}': 'biome lint --fix --no-errors-on-unmatched',
};
