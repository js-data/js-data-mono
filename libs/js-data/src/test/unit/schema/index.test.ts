import { JSData } from '../../_setup';
import { productSchema } from './_productSchema';

describe('Schema', () => {
  it('has the right exports', () => {
    expect(typeof JSData.Schema).toEqual('function');
    expect(typeof JSData.Schema.validate).toEqual('function');
    expect(JSData.Schema.types).toBeTruthy();
    expect(JSData.Schema.validationKeywords).toBeTruthy();
    expect(JSData.Schema.typeGroupValidators).toBeTruthy();
  });

  it('should recursively instantiate schemas', () => {
    const schemaDef = JSData.utils.plainCopy(productSchema);
    schemaDef.properties.things = {
      type: 'array',
      items: {
        type: 'number'
      }
    };
    schemaDef.properties.anyFoo = {
      anyOf: [{type: 'number'}, {type: 'string'}]
    };
    schemaDef.properties.allFoo = {
      allOf: [{type: 'number'}, {enum: [1, 2, 3]}]
    };
    schemaDef.properties.oneFoo = {
      oneOf: [{type: 'string'}, {enum: [1, 2, 3]}]
    };
    const ProductSchema = new JSData.Schema(schemaDef);
    expect(ProductSchema instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.id instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.name instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.price instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.tags instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.dimensions instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.warehouseLocation instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.things instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.things.items instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.anyFoo.anyOf[0] instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.anyFoo.anyOf[1] instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.allFoo.allOf[0] instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.allFoo.allOf[1] instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.oneFoo.oneOf[0] instanceof JSData.Schema).toBeTruthy();
    expect(ProductSchema.properties.oneFoo.oneOf[1] instanceof JSData.Schema).toBeTruthy();
  });

  it('should validate', () => {
    const ProductSchema = new JSData.Schema(productSchema);

    let errors = ProductSchema.validate({
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

    errors = ProductSchema.validate('foo');
    // return
    expect(errors).toEqual([{expected: 'one of (object)', actual: 'string', path: ''}]);
    errors = ProductSchema.validate(45);
    expect(errors).toEqual([{expected: 'one of (object)', actual: 'number', path: ''}]);
    errors = ProductSchema.validate(null);
    expect(errors).toEqual([{expected: 'one of (object)', actual: 'null', path: ''}]);
    errors = ProductSchema.validate(true);
    expect(errors).toEqual([{expected: 'one of (object)', actual: 'boolean', path: ''}]);
    errors = ProductSchema.validate(undefined);
    expect(!errors).toBeTruthy();
    errors = ProductSchema.validate({
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
  });
});
