import parser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';

// TypeScript parsing plus runtime correctness rules. tsc owns type checks.
export default [{
  files: ['src/**/*.ts'],
  languageOptions: { parser, ecmaVersion: 'latest', sourceType: 'module' },
  plugins: { '@typescript-eslint': ts },
  rules: {
    'no-debugger': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unsafe-negation': 'error',
    'constructor-super': 'error',
    'valid-typeof': 'error',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-misused-new': 'error',
  },
}];
