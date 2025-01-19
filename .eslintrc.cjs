module.exports = {
  plugins: [
    'react-compiler',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'prettier',
    '@typescript-eslint',
    'unused-imports'
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // React-specific linting rules
    'plugin:react/jsx-runtime', // React JSX runtime rules
    'plugin:react-hooks/recommended', // React hooks linting rules
    'plugin:jsx-a11y/recommended', // Accessibility linting for JSX
    'plugin:import/recommended', // Import/export linting rules
    'plugin:@typescript-eslint/recommended', // TypeScript-specific rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Type-aware TypeScript linting
    '@electron-toolkit/eslint-config-ts/recommended', // Electron Toolkit TypeScript rules
    '@electron-toolkit/eslint-config-prettier', // Prettier compatibility
    'prettier' // Ensure Prettier formatting is applied
  ],
  parser: '@typescript-eslint/parser', // Use TypeScript parser
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    // React-specific rules
    'react-compiler/react-compiler': 'error',
    'react/prop-types': 'off', // Disable prop-types since TypeScript is used
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX runtime
    'react/jsx-no-target-blank': 'warn', // Warn about unsafe `target="_blank"`

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'warn', // Encourage valid anchor elements
    'jsx-a11y/alt-text': 'error', // Ensure alt text for images

    // Import/export rules
    'unused-imports/no-unused-imports': 'error', // Automatically remove unused imports
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
    ],
    'import/no-unused-modules': ['warn', { unusedExports: true }], // Warn on unused exports
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }
    ], // Enforce consistent import order

    // General best practices
    'no-unused-vars': 'off', // Turn off base rule (handled by TypeScript)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_' // Ignore variables starting with _
      }
    ], // TypeScript-aware unused vars rule
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Warn on `console.log` but allow `console.warn` and `console.error`
    'no-debugger': 'error', // Disallow debugger statements
    'prefer-const': 'error', // Prefer `const` for variables that are never reassigned
    'arrow-body-style': ['warn', 'as-needed'], // Enforce concise arrow function bodies
    'no-var': 'error', // Disallow `var` in favor of `let` and `const`
    'no-shadow': 'off', // Disable base rule
    '@typescript-eslint/no-shadow': 'warn', // TypeScript-aware shadowing rule
    eqeqeq: ['error', 'always'], // Enforce strict equality
    'prettier/prettier': 'error' // Enforce Prettier formatting
  },
  settings: {
    react: {
      version: 'detect' // Automatically detect React version
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {} // Resolve TypeScript paths
    }
  }
};
