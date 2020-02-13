export const minLengthTests = [
  {
    description: 'minLength validation',
    schema: {minLength: 2},
    tests: [
      {
        description: 'longer is valid',
        data: 'foo',
        valid: true
      },
      {
        description: 'exact length is valid',
        data: 'fo',
        valid: true
      },
      {
        description: 'too short is invalid',
        data: 'f',
        valid: false
      },
      {
        description: 'ignores non-strings',
        data: 1,
        valid: true
      }
      // TODO make work,
      // {
      //   'description': 'one supplementary Unicode code point is not long enough',
      //   'data': '\uD83D\uDCA9',
      //   'valid': false
      // }
    ]
  }
];
