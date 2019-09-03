module.exports = {
  env: {
    browser: true,
    es6: true,
		mocha: true,
		node: true
  },
  extends: ['eslint:recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {},
    ecmaVersion: 2018,
  },
  plugins: [],
  rules: {},
  settings: {},
};
