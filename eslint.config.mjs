import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Disable rules that conflict with Prettier
      'prettier/prettier': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/semi': 'off',
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-closing-bracket-location': 'off',
      'react/jsx-closing-tag-location': 'off',
      'react/jsx-curly-spacing': 'off',
      'react/jsx-equals-spacing': 'off',
      'react/jsx-first-prop-new-line': 'off',
      'react/jsx-max-props-per-line': 'off',
      'react/jsx-props-no-multi-spaces': 'off',
      'react/jsx-tag-spacing': 'off',
      'react/jsx-wrap-multilines': 'off',
      // Additional helpful rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
