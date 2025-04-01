// Copyright 2024 JKRB Investments Limited. All rights reserved.

import pluginJs from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,cjs,mjs,ts}'],
  },
  {
    ignores: [
      '**/*.css',
      '**/*.scss',
      '**/*.json',
      '**/*.log',
      '**/*.lock',
      '**/*.md',
      '**/*.ico',
      '**/*.ttf',
      '**/*.xml',
      '**/*.txt',
      '**/*.cjs',
      '**/*.webmanifest',
      '**/LICENSE',
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/CHANGELOG.md',
      '**/.licenserc.json',
      '**/tsup.config.ts',
    ],
  },
  pluginJs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'prefer-arrow-functions': preferArrowFunctions,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          arrowFunctions: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            'tsconfig.json',
            'library/*/tsconfig.json',
            'builder/tsconfig.json',
          ],
        },
      },
    },
    rules: {
      // Prettier
      'prettier/prettier': [
        'error',
        {
          semi: false,
        },
      ],
      // Stylistic
      curly: 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      'object-shorthand': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
        },
      ],
      semi: ['error', 'never'],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
        },
      ],
      'prefer-arrow-functions/prefer-arrow-functions': [
        'warn',
        {
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: 'unchanged',
          singleReturnOnly: false,
        },
      ],
      // Typescript
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
    },
  },
]
