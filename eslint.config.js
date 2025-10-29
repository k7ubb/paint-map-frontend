import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig({
	files: ['src/**/*.{ts,tsx}'],
	plugins: { 
		js,
		'@typescript-eslint': tsPlugin
	},
	languageOptions: {
		parser: tseslint.parser,
		globals: {
			...globals.browser,
			...globals.node,
		},
	},
	extends: [
		'js/recommended',
	],
	rules: {
		'semi': ['error', 'always'],
		'quotes': ['error', 'single'],
		'indent': ['error', 'tab'],
		'no-undef': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', {
			argsIgnorePattern: '^_',
			varsIgnorePattern: '^_',
			args: 'none'
		}]
	}
});
