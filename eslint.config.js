import js from '@eslint/js'
import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'
import sonarjs from 'eslint-plugin-sonarjs'
import security from 'eslint-plugin-security'
import promise from 'eslint-plugin-promise'
import noUnsanitized from 'eslint-plugin-no-unsanitized'
import checkFile from 'eslint-plugin-check-file'
import cspellPlugin from '@cspell/eslint-plugin'

export default [
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'build/**',
			'.git/**',
			'coverage/**'
		]
	},
	{
		files: ['**/*'],
		plugins: {
			'check-file': checkFile
		},
		rules: {
			'check-file/filename-naming-convention': ['error', { '**/*': 'CAMEL_CASE' }, { ignoreMiddleExtensions: true }],
			'check-file/folder-naming-convention': ['error', { '**/*': 'CAMEL_CASE' }]
		}
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021
			}
		},
		plugins: {
			jsdoc,
			sonarjs,
			security,
			promise,
			'no-unsanitized': noUnsanitized,
			'@cspell': cspellPlugin
		},
		settings: {
			jsdoc: {
				mode: 'typescript',
				checkExampleIterable: true
			}
		},
		rules: {
			...js.configs.recommended.rules,
			...sonarjs.configs.recommended.rules,
			...security.configs.recommended.rules,
			...promise.configs.recommended.rules,
			...noUnsanitized.configs.recommended.rules,

			// Lang
			'@cspell/spellchecker': ['error', {
				'checkComments': true,
				'checkIdentifiers': false,
				'checkStrings': false,
				'cspell': {
					'ignoreRegExpList': ['/[a-zA-Z]+/g'],
					'flagWords': ['/[^\\x00-\\x7F]/g']
				}
			}],

			// === Security ===
			'security/detect-object-injection': 'off',
			'security/detect-unsafe-regex': 'error',

			// === No-Unsanitized ===
			'no-unsanitized/method': 'error',
			'no-unsanitized/property': 'error',

			// === Promise ===
			'promise/always-return': 'error',
			'promise/no-return-wrap': 'error',
			'promise/catch-or-return': 'error',

			// === SonarJS ===
			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/cognitive-complexity': 'error',
			'sonarjs/no-identical-expressions': 'error',

			// === JSDoc ===
			'jsdoc/check-alignment': 'error',
			'jsdoc/check-indentation': ['error', { excludeTags: ['example'] }],
			'jsdoc/check-values': 'error',
			'jsdoc/check-types': ['error', { unifyParentAndChildTypeChecks: true }],
			'jsdoc/no-types': 'off',
			'jsdoc/no-multi-asterisks': ['error', {
				'allowWhitespace': true,
				'preventAtMiddleLines': true,
				'preventAtEnd': true
			}],

			'jsdoc/require-jsdoc': ['error', {
				require: {
					FunctionDeclaration: true,
					MethodDefinition: true,
					ClassDeclaration: true,
					FunctionExpression: false
				},
				contexts: [
					'FunctionDeclaration',
					'MethodDefinition',
					'ClassDeclaration'
				]
			}],
			'jsdoc/valid-types': 'error',
			'jsdoc/require-param-type': 'error',
			'jsdoc/require-returns-type': 'error',
			'jsdoc/require-param': 'error',
			'jsdoc/require-returns': 'error',
			'jsdoc/check-param-names': 'error',
			'jsdoc/empty-tags': 'warn',
			'jsdoc/no-undefined-types': 'warn',

			// === ESLint ===
			'indent': ['error', 'tab'],
			'quotes': ['error', 'single'],
			'semi': ['error', 'never'],
			'comma-dangle': ['error', 'never'],
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'arrow-spacing': ['error', { 'before': true, 'after': true }],
			'brace-style': ['error', '1tbs'],
			'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
			'keyword-spacing': ['error', { 'before': true, 'after': true }],
			'space-before-blocks': ['error', 'always'],
			'no-multiple-empty-lines': ['error', { 'max': 1 }],
			'eol-last': ['error', 'never'],
			'linebreak-style': 'off',
			'eqeqeq': ['error', 'always'],
			'no-var': 'error',
			'prefer-const': 'error',
			'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
			'no-unused-vars': ['warn', {
				'argsIgnorePattern': '^_',
				'varsIgnorePattern': '^_'
			}],
			'no-shadow': 'error',
			'no-use-before-define': ['error', {
				'functions': false,
				'classes': true,
				'variables': true
			}],
			'object-shorthand': ['error', 'always'],
			'no-await-in-loop': 'error',
			'require-atomic-updates': 'error',
			'curly': ['error', 'all'],
			'default-case': 'warn',
			'no-else-return': 'warn'
		}
	}
]