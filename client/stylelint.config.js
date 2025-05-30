module.exports = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
    }],
    'at-rule-no-deprecated': [true, { ignoreAtRules: ['apply'] }]
  }
};
