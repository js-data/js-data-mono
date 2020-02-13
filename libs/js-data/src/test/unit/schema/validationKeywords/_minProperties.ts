export const minPropertiesTests = [
  {
    description: 'minProperties validation',
    schema: {minProperties: 1},
    tests: [
      {
        description: 'longer is valid',
        data: {foo: 1, bar: 2},
        valid: true
      },
      {
        description: 'exact length is valid',
        data: {foo: 1},
        valid: true
      },
      {
        description: 'too short is invalid',
        data: {},
        valid: false
      },
      {
        description: 'ignores non-objects',
        data: '',
        valid: true
      }
    ]
  }
];
