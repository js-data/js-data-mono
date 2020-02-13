import { JSData } from '../../_setup';

describe('Collection#forEach', () => {
  it('should visit all data', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    let count = 0;
    let prev;
    let isInOrder = true;
    const collection = new JSData.Collection(data);
    collection.forEach(value => {
      if (prev) {
        isInOrder = isInOrder && value.id > prev.id;
      }
      value.visited = true;
      count++;
      prev = value;
    });
    expect(collection.getAll()).toEqual([
      {id: 1, visited: true},
      {id: 2, visited: true},
      {id: 3, visited: true}
    ]);
    expect(count).toEqual(3);
    expect(isInOrder).toBeTruthy();
  });
  it('should forEach', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const collection = new JSData.Collection(data);
    let sum = 0;
    const expectedSum = data.reduce((prev, curr) => prev + curr.id, 0);
    const ctx = {};
    collection.forEach(function (item) {
      sum = sum + item.id;
      expect(this === ctx).toBeTruthy();
    }, ctx);
    expect(sum).toEqual(expectedSum);
  });
});
