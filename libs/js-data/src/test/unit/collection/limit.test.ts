import { JSData, TYPES_EXCEPT_NUMBER } from '../../_setup';

describe('Collection#limit', () => {
  it('should limit', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const collection = new JSData.Collection(data);
    TYPES_EXCEPT_NUMBER.forEach(value => {
      expect(() => collection.limit(value)).toThrow();
    });
    expect(collection.limit(1)).toEqual([{id: 1}]);
    expect(collection.limit(2)).toEqual([{id: 1}, {id: 2}]);
    expect(collection.limit(3)).toEqual([{id: 1}, {id: 2}, {id: 3}]);
    expect(collection.limit(4)).toEqual([{id: 1}, {id: 2}, {id: 3}]);
  });
});
