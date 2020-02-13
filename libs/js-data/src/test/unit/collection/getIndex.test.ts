import { JSData } from '../../_setup';

describe('Collection#getIndex', () => {
  it('should get an index', () => {
    const collection = new JSData.Collection();
    collection.createIndex('age');
    expect(() => {
      const index = collection.getIndex('age');
      expect(index instanceof JSData.Index).toEqual(true);
    }).not.toThrow();
  });

  it('should error if index does not exist', () => {
    const collection = new JSData.Collection();
    expect(() => {
      collection.getIndex('age');
    }).toThrow();
  });
});
