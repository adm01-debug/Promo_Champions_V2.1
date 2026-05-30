module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'perf',
      'test',
      'chore',
      'ci',
      'build'
    ]],
    'scope-enum': [2, 'always', [
      'auth',
      'bi',
      'crm',
      'gamification',
      'ui',
      'hooks',
      'services',
      'db',
      'config',
      'deps'
    ]]
  }
};
