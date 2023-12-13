module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "google", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
};
