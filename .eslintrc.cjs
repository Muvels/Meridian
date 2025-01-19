module.exports = {
  plugins: ['react-compiler'],
  rules: {
    'react-compiler/react-compiler': 'error'
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ]
}
