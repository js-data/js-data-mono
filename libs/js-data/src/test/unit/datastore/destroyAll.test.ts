import { JSData, store } from '../../_setup';

describe('DataStore#destroyAll', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.destroyAll).toEqual('function');
    expect(store.destroyAll).toBe(DataStore.prototype.destroyAll);
  });
  it('should destroyAll', async function () {
    const query = {name: 'John'};
    let destroyCalled;
    store._pendingQueries.user[store.hashQuery('user', query)] = new Date().getTime();
    store._completedQueries.user[store.hashQuery('user', query)] = new Date().getTime();
    const users = store.add('user', [{id: 1, name: 'John'}]);
    store.registerAdapter(
      'mock',
      {
        destroyAll() {
          destroyCalled = true;
          return JSData.utils.resolve();
        }
      },
      {default: true}
    );
    const result = await store.destroyAll('user', query);
    expect(destroyCalled).toBeTruthy();
    expect(result).toEqual(users);
  });
  it('should return raw', async function () {
    const query = {name: 'John'};
    let destroyCalled;
    store._pendingQueries.user[store.hashQuery('user', query)] = new Date().getTime();
    store._completedQueries.user[store.hashQuery('user', query)] = new Date().getTime();
    const users = store.add('user', [{id: 1, name: 'John'}]);
    store.registerAdapter(
      'mock',
      {
        destroyAll() {
          destroyCalled = true;
          return JSData.utils.resolve({
            deleted: 1
          });
        }
      },
      {default: true}
    );
    const result = await store.destroyAll('user', query, {raw: true});
    expect(destroyCalled).toBeTruthy();
    expect(!store._pendingQueries.user[store.hashQuery('user', query)]).toBeTruthy();
    expect(!store._completedQueries.user[store.hashQuery('user', query)]).toBeTruthy();
    expect(!store.get('user', 1)).toBeTruthy();
    expect(result.adapter).toEqual('mock');
    expect(result.deleted).toEqual(1);
    expect(result.data).toEqual(users);
  });
});
