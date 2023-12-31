// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2022 : true
  },
  extends      : 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13,
    sourceType : 'module'
  },
  globals: {
    html     : 'readonly',
    scheduler: 'readonly'
  },
  rules: {
    indent                       : [2, 2],
    quotes                       : [2, 'single'],
    'quote-props'                : [2, 'as-needed'],
    semi                         : [2, 'never'],
    eqeqeq                       : 2,
    'dot-notation'               : 2,
    'guard-for-in'               : 2,
    'no-else-return'             : 2,
    'no-loop-func'               : 2,
    'no-multi-spaces'            : 2,
    'no-redeclare'               : 2,
    'no-self-compare'            : 2,
    'no-useless-concat'          : 2,
    'no-spaced-func'             : 2,
    'no-var'                     : 2,
    'brace-style'                : 2,
    'array-bracket-spacing'      : [2, 'never'],
    'object-curly-spacing'       : [2, 'never'],
    'comma-dangle'               : [2, 'never'],
    'comma-spacing'              : [2, {before: false, after: true}],
    'key-spacing'                : [2, {mode: 'strict', align: 'colon'}],
    'arrow-spacing'              : 2,
    'computed-property-spacing'  : [2, 'never'],
    'no-unneeded-ternary'        : 2,
    'space-infix-ops'            : 2,
    'space-in-parens'            : 2,
    'space-before-blocks'        : 2,
    'space-before-function-paren': [2, 'never']
  }
}
