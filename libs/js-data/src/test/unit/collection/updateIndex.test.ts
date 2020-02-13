import { JSData } from '../../_setup';

describe('Collection#updateIndex', () => {
  it('should update record in a single index', () => {
    const data = [
      {id: 2, age: 19},
      {id: 1, age: 27}
    ];
    const collection = new JSData.Collection(data);
    collection.createIndex('age');
    expect(collection.getAll(3).length).toEqual(0);
    expect(collection.getAll(27, {index: 'age'}).length).toEqual(1);
    data[1].age = 26;
    data[1].id = 3;
    collection.updateIndex(data[1], {index: 'age'});
    expect(collection.getAll(3).length).toEqual(0);
    expect(collection.getAll(26, {index: 'age'}).length).toEqual(1);
    expect(collection.getAll(27, {index: 'age'}).length).toEqual(0);
    collection.updateIndex(data[1]);
    expect(collection.getAll(1).length).toEqual(0);
    expect(collection.getAll(3).length).toEqual(1);
  });
});
