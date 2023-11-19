/* eslint-disable @typescript-eslint/no-var-requires */
const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        '@nuxtjs/eslint-config-typescript',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    plugins: [
        'vue',
        '@typescript-eslint',
    ],
    rules: {
        'comma-dangle': ['error', 'only-multiline'],
        indent: ['error', 4, {
            SwitchCase: 1,
        }],
        'import/no-duplicates': ['error', { considerQueryString: true }],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always',
        }],
        'vue/block-tag-newline': ['error', {
            singleline: 'always',
            multiline: 'always',
            maxEmptyLines: 0,
        }],
        'vue/comma-dangle': ['error', 'only-multiline'],
        'vue/html-indent': ['error', 4],
        'vue/key-spacing': ['error', {
            beforeColon: false,
            afterColon: true,
            mode: 'strict',
        }],
        'vue/max-attributes-per-line': ['error', {
            singleline: {
                max: 1,
            },
            multiline: {
                max: 1,
            },
        }],
        'vue/object-curly-newline': ['error', { multiline: true }],
        'vue/object-curly-spacing': ['error', 'always'],
        'vue/object-property-newline': 'error',
        'vue/padding-line-between-blocks': ['error', 'always'],
        'vue/padding-line-between-tags': ['error', [{ blankLine: 'always', prev: '*', next: '*' }]],
        'vue/singleline-html-element-content-newline': ['error', {
            ignoreWhenNoAttributes: true,
            ignoreWhenEmpty: true,
            ignores: ['nuxt-link', ...INLINE_ELEMENTS],
        }],
    },
}
