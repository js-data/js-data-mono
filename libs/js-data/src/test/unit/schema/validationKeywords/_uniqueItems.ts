export const uniqueItemsTests = [
  {
    description: 'uniqueItems validation',
    schema: { uniqueItems: true },
    tests: [
      {
        description: 'unique array of integers is valid',
        data: [1, 2],
        valid: true
      },
      {
        description: 'non-unique array of integers is invalid',
        data: [1, 1],
        valid: false
      },
      {
        description: 'numbers are unique if mathematically unequal',
        data: [1.0, 1.0, 1],
        valid: false
      },
      {
        description: 'unique array of objects is valid',
        data: [{ foo: 'bar' }, { foo: 'baz' }],
        valid: true
      },
      {
        description: 'non-unique array of objects is invalid',
        data: [{ foo: 'bar' }, { foo: 'bar' }],
        valid: false
      },
      {
        description: 'unique array of nested objects is valid',
        data: [{ foo: { bar: { baz: true } } }, { foo: { bar: { baz: false } } }],
        valid: true
      },
      {
        description: 'non-unique array of nested objects is invalid',
        data: [{ foo: { bar: { baz: true } } }, { foo: { bar: { baz: true } } }],
        valid: false
      },
      {
        description: 'unique array of arrays is valid',
        data: [['foo'], ['bar']],
        valid: true
      },
      {
        description: 'non-unique array of arrays is invalid',
        data: [['foo'], ['foo']],
        valid: false
      },
      {
        description: '1 and true are unique',
        data: [1, true],
        valid: true
      },
      {
        description: '0 and false are unique',
        data: [0, false],
        valid: true
      },
      {
        description: 'unique heterogeneous types are valid',
        data: [{}, [1], true, null, 1],
        valid: true
      },
      {
        description: 'non-unique heterogeneous types are invalid',
        data: [{}, [1], true, null, {}, 1],
        valid: false
      }
    ]
  }
]
