import { ESLint } from 'eslint';

const eslint = new ESLint();

export default {
  extends: eslint.configs.recommended,
  files: ['**/*.{js,jsx,ts,tsx}'],
  ignores: ['**/dist/**'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      console: 'readonly',
      localStorage: 'readonly',
      fetch: 'readonly',
      URL: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setImmediate: 'readonly',
      performance: 'readonly',
      MutationObserver: 'readonly',
      MessageChannel: 'readonly',
      queueMicrotask: 'readonly',
      __REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',
      DOMException: 'readonly',
      MSApp: 'readonly',
    },
  },
  plugins: {
    react: require('eslint-plugin-react'),
    'react-hooks': require('eslint-plugin-react-hooks'),
    'react-refresh': require('eslint-plugin-react-refresh'),
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-undef': ['error', { typeof: true }],
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-prototype-builtins': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-useless-escape': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};