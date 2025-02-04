import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['lib/**/*.ts', 'test/**/*.ts', 'index.ts'],
        ignores: ['dist/**/*.js'],
    },
    {
        languageOptions: { globals: globals.node },
    },
    ...tseslint.configs.recommended,
];
