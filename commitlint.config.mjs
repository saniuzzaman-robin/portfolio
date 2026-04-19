const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Changes that don't affect code meaning (formatting, missing semicolons, etc)
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to build process, dependencies, or other non-code changes
        'ci', // Changes to CI configuration files and scripts
        'revert', // Reverts a previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-empty': [0],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [0],
    'header-max-length': [2, 'always', 100],
  },
};

export default config;
