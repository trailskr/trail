module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    browser: true
  },
  plugins: ['prefer-arrow', 'unused-imports', 'import'],
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-void': ['error', { allowAsStatement: true }],
    'no-undef': 'off',
    quotes: ['error', 'single', { avoidEscape: true }],
    'require-await': ['error'],

    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    semi: 'off', // There is a TS analog @typescript-eslint/semi
    'no-unused-expressions': 'off', // There is a TS analog @typescript-eslint/no-unused-expressions, this rule does not take into account the operator ?.
    'no-useless-constructor': 'off', // Used instead @typescript-eslint/no-useless-constructor

    'prefer-promise-reject-errors': 'off',

    // TypeScript
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'comma' }
      }
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
    '@typescript-eslint/no-unused-expressions': ['error'],
    '@typescript-eslint/no-unused-vars': 'off', // used 'unused-imports/no-unused-vars-ts' instead
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false
      }
    ],

    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': ['error', { vars: 'all', args: 'none', varsIgnorePattern: '^_' }],

    'import/no-default-export': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false
        },
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'import/no-default-export': 'off'
      }
    },
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
        'import/no-default-export': 'off'
      }
    }
  ]
}