module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'scope-enum': [0],
    'scope-empty': [2, 'never'],
    'function-rules/scope-enum': [
      2,
      'always',
      (parsed) => {
        if (parsed.scope === '#N/A' || /^#[1-9]\d*$/.test(parsed.scope)) {
          return [true]
        }
        return [false, 'scope should be like: #<card number>']
      }
    ]
  }
}
