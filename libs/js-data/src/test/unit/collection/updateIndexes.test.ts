import { JSData } from '../../_setup';

describe('Collection#updateIndexes', () => {
  it('should update a record in all indexes', () => {
    const data = [
      {id: 2, age: 19},
      {id: 1, age: 27}
    ];
    const collection = new JSData.Collection(data);
    collection.createIndex('age');
    expect(collection.getAll(27, {index: 'age'}).length).toEqual(1);
    data[1].age = 26;
    collection.updateIndexes(data[1]);
    expect(collection.getAll(26, {index: 'age'}).length).toEqual(1);
    expect(collection.getAll(27, {index: 'age'}).length).toEqual(0);
  });
});
