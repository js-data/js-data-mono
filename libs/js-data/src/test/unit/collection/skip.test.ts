import { JSData, TYPES_EXCEPT_NUMBER } from '../../_setup';

describe('Collection#skip', () => {
  it('should skip', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const collection = new JSData.Collection(data);
    TYPES_EXCEPT_NUMBER.forEach(value => {
      expect(() => {
        collection.skip(value);
      }).toThrow();
    });
    expect(collection.skip(1)).toEqual([{id: 2}, {id: 3}]);
    expect(collection.skip(2)).toEqual([{id: 3}]);
    expect(collection.skip(3)).toEqual([]);
    expect(collection.skip(4)).toEqual([]);
  });
  it('should skip and limit', () => {
    const data = [{id: 2}, {id: 3}, {id: 5}, {id: 6}, {id: 4}, {id: 1}];
    const collection = new JSData.Collection(data);
    expect(collection
      .query()
      .skip(1)
      .limit(1)
      .run()).toEqual([{id: 2}]);
    expect(collection
      .query()
      .skip(4)
      .limit(2)
      .run()).toEqual([{id: 5}, {id: 6}]);
    expect(collection
      .query()
      .skip(5)
      .limit(3)
      .run()).toEqual([{id: 6}]);
    expect(collection
      .query()
      .skip(1)
      .limit(7)
      .run()).toEqual([{id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]);
  });
});
