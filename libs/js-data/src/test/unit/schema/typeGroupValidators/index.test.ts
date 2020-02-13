import { JSData } from '../../../_setup';

describe('Schema.typeGroupValidators', () => {
  it('has the right default validators', () => {
    const typeGroupValidators = JSData.Schema.typeGroupValidators;
    const EXPECTED_KEYS = ['array', 'integer', 'number', 'numeric', 'object', 'string'];
    expect(Object.keys(typeGroupValidators)).toEqual(EXPECTED_KEYS);
  });

  it('allows custom validation keywords', () => {
    const STRING_OPS = JSData.Schema.STRING_OPS;
    const validationKeywords = JSData.Schema.validationKeywords;
    STRING_OPS.push('foo');
    validationKeywords.foo = (value, schema, opts) => {
      if (value !== 'bar') {
        return [
          {
            actual: value,
            expected: 'bar',
            path: opts.path[0]
          }
        ];
      }
    };
    const schema = new JSData.Schema({
      type: 'object',
      properties: {
        thing: {foo: true, type: 'string', required: true},
        name: {type: 'string'}
      }
    });
    let errors = schema.validate({
      name: 1234
    });

    expect(errors).toEqual([
      {
        expected: 'a value',
        actual: 'undefined',
        path: 'thing'
      },
      {
        expected: 'one of (string)',
        actual: 'number',
        path: 'name'
      }
    ]);

    errors = schema.validate({
      name: 'john',
      thing: 'baz'
    });
    expect(errors).toEqual([
      {
        expected: 'bar',
        actual: 'baz',
        path: 'thing'
      }
    ]);

    errors = schema.validate({
      name: 'john',
      thing: 'bar'
    });
    expect(errors).toEqual(undefined);

    delete validationKeywords.foo;
    STRING_OPS.pop();
  });
});
