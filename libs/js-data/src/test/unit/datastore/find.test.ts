import { JSData, store, User } from '../../_setup';

describe('DataStore#find', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.find).toEqual('function');
    expect(store.find).toBe(DataStore.prototype.find);
  });
  it('should find', async function () {
    const id = 1;
    const props = {id, name: 'John'};
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        find() {
          callCount++;
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const user = await store.find('user', id);
    expect(callCount).toEqual(1);
    expect(typeof store._completedQueries.user[id]).toEqual('function');
    expect(user).toEqual(props);
    expect(user instanceof User.recordClass).toBeTruthy();
    expect(user).toBe(await store.find('user', id));
    expect(callCount).toEqual(1);
    expect(user).toBe(await store.find('user', id, {force: true}));
    expect(callCount).toEqual(2);
    expect(user).toBe(await store.find('user', id));
    expect(callCount).toEqual(2);
  });
  it('should return pending query', async function () {
    const id = 1;
    const props = {id, name: 'John'};
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        find() {
          callCount++;
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(props);
            }, 300);
          });
        }
      },
      {default: true}
    );
    const users = await Promise.all([store.find('user', id), store.find('user', id)]);
    expect(callCount).toEqual(1);
    expect(users[0]).toEqual(props);
    expect(users[1]).toEqual(props);
    expect(users[0]).toBe(users[1]);
  });
  it('should delete pending query on error', function () {
    const id = 1;
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        find() {
          callCount++;
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('foo'));
            }, 300);
          });
        }
      },
      {default: true}
    );
    const pendingQuery = store.find('user', id);
    expect(store._pendingQueries.user[id]).toBeTruthy();
    return pendingQuery.catch(err => {
      expect(callCount).toEqual(1);
      expect(!store._pendingQueries.user[id]).toBeTruthy();
      expect(err.message).toEqual('foo');
    });
  });
});
