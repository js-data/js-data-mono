export const minItemsTests = [
  {
    description: 'minItems validation',
    schema: {minItems: 1},
    tests: [
      {
        description: 'longer is valid',
        data: [1, 2],
        valid: true
      },
      {
        description: 'exact length is valid',
        data: [1],
        valid: true
      },
      {
        description: 'too short is invalid',
        data: [],
        valid: false
      },
      {
        description: 'ignores non-arrays',
        data: '',
        valid: true
      }
    ]
  }
];
