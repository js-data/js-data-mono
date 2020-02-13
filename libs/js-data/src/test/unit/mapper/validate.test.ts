import { JSData } from '../../_setup';
import { productSchema } from '../schema/_productSchema';

describe('Mapper#validate', () => {
  it('should validate a record', () => {
    const ProductMapper = new JSData.Mapper({
      name: 'product',
      schema: productSchema
    });

    let errors = ProductMapper.validate({
      id: 3,
      name: 'A blue mouse',
      price: 25.5,
      dimensions: {
        length: 3.1,
        width: 1.0,
        height: 1.0
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    });

    expect(!errors).toBeTruthy();

    errors = ProductMapper.validate([
      {
        id: 3,
        name: 'A blue mouse',
        price: 25.5,
        dimensions: {
          length: 3.1,
          width: 1.0,
          height: 1.0
        },
        warehouseLocation: {
          latitude: 54.4,
          longitude: -32.7
        }
      }
    ]);

    expect(!errors).toBeTruthy();

    errors = ProductMapper.validate({
      id: 3,
      // name is missing
      price: 'wrong top',
      dimensions: {
        length: 3.1,
        // width is missing
        height: 'should be a number'
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    });
    expect(errors).toEqual([
      {expected: 'a value', actual: 'undefined', path: 'name'},
      {expected: 'one of (number)', actual: 'string', path: 'price'},
      {expected: 'a value', actual: 'undefined', path: 'dimensions.width'},
      {expected: 'one of (number)', actual: 'string', path: 'dimensions.height'}
    ]);

    errors = ProductMapper.validate([
      {
        id: 3,
        // name is missing
        price: 'wrong top',
        dimensions: {
          length: 3.1,
          // width is missing
          height: 'should be a number'
        },
        warehouseLocation: {
          latitude: 54.4,
          longitude: -32.7
        }
      }
    ]);
    expect(errors).toEqual([
      [
        {expected: 'a value', actual: 'undefined', path: 'name'},
        {expected: 'one of (number)', actual: 'string', path: 'price'},
        {expected: 'a value', actual: 'undefined', path: 'dimensions.width'},
        {expected: 'one of (number)', actual: 'string', path: 'dimensions.height'}
      ]
    ]);
  });
  it('should validate based on json-schema.org rules', () => {
    const User = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          age: {
            type: 'number'
          },
          title: {
            type: ['string', 'null']
          },
          level: {}
        }
      }
    });

    const user = User.createRecord({id: 1, age: 30, title: 'boss', level: 1});

    try {
      user.age = 'foo';
      expect(false).toBe(true);
    } catch (err) {
      expect(err instanceof Error).toBeTruthy();
      expect(err.errors).toEqual([
        {
          actual: 'string',
          expected: 'one of (number)',
          path: 'age'
        }
      ]);
      expect(err.message).toEqual('validation failed');
    }
    try {
      user.age = {};
    } catch (err) {
      expect(err instanceof Error).toBeTruthy();
      expect(err.errors).toEqual([
        {
          actual: 'object',
          expected: 'one of (number)',
          path: 'age'
        }
      ]);
      expect(err.message).toEqual('validation failed');
    }
    expect(() => {
      user.age = undefined;
    }).not.toThrow();
    try {
      user.title = 1234;
    } catch (err) {
      expect(err instanceof Error).toBeTruthy();
      expect(err.errors).toEqual([
        {
          actual: 'number',
          expected: 'one of (string, null)',
          path: 'title'
        }
      ]);
      expect(err.message).toEqual('validation failed');
    }
    expect(() => {
      user.title = 'foo';
    }).not.toThrow();
    expect(() => {
      user.title = null;
    }).not.toThrow();
    expect(() => {
      user.title = undefined;
    }).not.toThrow();

    try {
      const user = User.createRecord({age: 'foo'});
      user.set('foo', 'bar');
    } catch (err) {
      expect(err instanceof Error).toBeTruthy();
      expect(err.errors).toEqual([
        {
          actual: 'string',
          expected: 'one of (number)',
          path: 'age'
        }
      ]);
      expect(err.message).toEqual('validation failed');
    }

    expect(() => {
      const user = User.createRecord({age: 'foo'}, {noValidate: true});
      user.set('foo', 'bar');
    }).not.toThrow();
  });
});
