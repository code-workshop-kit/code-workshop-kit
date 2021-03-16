module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@open-wc/eslint-config',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:chai-friendly/recommended',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'import/extensions': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
