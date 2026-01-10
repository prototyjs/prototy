import js from '@eslint/js'
import globals from 'globals'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
    // 1. Глобальные игноры
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            'build/**',
            '.git/**',
            'coverage/**'
        ]
    },

    // 2. Базовые рекомендуемые правила + ваши правила
    {
        files: ['**/*.js'], // Все JS файлы проекта
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
            jsdoc
        },
        rules: {
            ...js.configs.recommended.rules, // Включаем recommended правила

            // === JSDoc ===
            'jsdoc/require-jsdoc': ['error', {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true,
                    ArrowFunctionExpression: false, // Обычно не требуют JSDoc
                    FunctionExpression: false
                },
                contexts: [
                    'FunctionDeclaration',
                    'MethodDefinition',
                    'ClassDeclaration'
                ]
            }],
            'jsdoc/check-types': 'error',
            'jsdoc/require-param-type': 'error',
            'jsdoc/require-returns-type': 'error',
            'jsdoc/require-param': 'error',
            'jsdoc/require-returns': 'error',
            'jsdoc/check-param-names': 'error',
            'jsdoc/empty-tags': 'warn',
            'jsdoc/no-undefined-types': 'warn',

            // === Форматирование ===
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
            'linebreak-style': ['error', 'unix'],

            // === Логика и чистота кода ===
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