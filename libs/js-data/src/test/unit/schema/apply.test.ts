import { JSData } from '../../_setup';
import { productSchema } from './_productSchema';

describe('Schema.apply', () => {
  it('has the right exports', () => {
    expect(typeof JSData.Schema.prototype.apply).toBe('function');
  });

  it('applies a property descriptor to the specified property', () => {
    class Thing extends JSData.Settable {}

    const schema = new JSData.Schema(productSchema);
    schema.apply(Thing.prototype);

    JSData.utils.forOwn(productSchema.properties, (_schema, prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, prop);
      expect(!!descriptor.writable).toEqual(false);
      expect(descriptor.enumerable).toEqual(true);
      expect(descriptor.configurable).toEqual(true);
      expect(typeof descriptor.get).toEqual('function');
      expect(typeof descriptor.set).toEqual('function');
    });
  });
});
