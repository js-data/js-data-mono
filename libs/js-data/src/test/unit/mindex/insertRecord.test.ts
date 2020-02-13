import { JSData } from '../../_setup';

describe('Index#insertRecord', () => {
  it('should insert records', () => {
    const index = new JSData.Index(['id'], {
      hashCode(obj) {
        return JSData.utils.get(obj, 'id');
      }
    });
    const record1 = {id: 1, age: 30};
    const record2 = {id: 5, age: 27};
    const record3 = {name: 'John', age: 18};
    const record4 = {id: 3, age: 45};
    const record5 = {age: 97};
    const record6 = {id: 2, age: 55};
    const record7 = {id: 6, age: 97};
    const record8 = {id: 8, age: 97};
    const record9 = {id: 7, age: 97};
    const record10 = {id: 10};
    index.insertRecord(record1);
    index.insertRecord(record2);
    index.insertRecord(record3);
    index.insertRecord(record4);
    index.insertRecord(record5);
    index.insertRecord(record6);
    index.insertRecord(record7);
    index.insertRecord(record8);
    index.insertRecord(record9);
    index.insertRecord(record10);

    expect(index.get()).toEqual([record5, record3]);
    expect(index.keys).toEqual([undefined, 1, 2, 3, 5, 6, 7, 8, 10]);
    expect(index.values).toEqual([
      [record5, record3],
      [record1],
      [record6],
      [record4],
      [record2],
      [record7],
      [record9],
      [record8],
      [record10]
    ]);

    const index2 = new JSData.Index(['age'], {
      hashCode(obj) {
        return JSData.utils.get(obj, 'id');
      }
    });
    index2.insertRecord(record1);
    index2.insertRecord(record2);
    index2.insertRecord(record3);
    index2.insertRecord(record4);
    index2.insertRecord(record5);
    index2.insertRecord(record6);
    index2.insertRecord(record7);
    index2.insertRecord(record8);
    index2.insertRecord(record9);
    index2.insertRecord(record10);

    expect(index2.keys).toEqual([undefined, 18, 27, 30, 45, 55, 97]);
    expect(index2.values).toEqual([
      [record10],
      [record3],
      [record2],
      [record1],
      [record4],
      [record6],
      [record5, record7, record9, record8]
    ]);
    const records = index2.between([44], [98]);

    expect(records).toEqual([record4, record6, record5, record7, record9, record8]);
  });
});
