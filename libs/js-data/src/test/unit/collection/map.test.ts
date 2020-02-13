import { JSData } from '../../_setup';

describe('Collection#map', () => {
  it('should map', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const collection = new JSData.Collection(data);
    const ctx = {};
    const mapping = collection.map(function (item) {
      expect(this === ctx).toBeTruthy();
      return item.id;
    }, ctx);
    expect(mapping.indexOf(1) !== -1).toBeTruthy();
    expect(mapping.indexOf(2) !== -1).toBeTruthy();
    expect(mapping.indexOf(3) !== -1).toBeTruthy();
    expect(mapping.length).toEqual(3);
  });
});
