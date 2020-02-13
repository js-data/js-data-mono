import { JSData } from '../../_setup';

describe('DataStore#getCollection', () => {
  it('should work', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.getCollection).toEqual('function');
    expect(store.getCollection).toBe(DataStore.prototype.getCollection);

    store.defineMapper('user');
    expect(store._collections.user).toBe(store.getCollection('user'));

    expect(() => {
      store.getCollection('foo');
    }).toThrow();
  });
});
