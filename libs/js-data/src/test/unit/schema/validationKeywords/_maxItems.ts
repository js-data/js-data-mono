export const maxItemsTests = [
  {
    description: 'maxItems validation',
    schema: {maxItems: 2},
    tests: [
      {
        description: 'shorter is valid',
        data: [1],
        valid: true
      },
      {
        description: 'exact length is valid',
        data: [1, 2],
        valid: true
      },
      {
        description: 'too long is invalid',
        data: [1, 2, 3],
        valid: false
      },
      {
        description: 'ignores non-arrays',
        data: 'foobar',
        valid: true
      }
    ]
  }
];
