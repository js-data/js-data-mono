import { JSData, store, User } from '../../_setup';

describe('DataStore#findAll', () => {
  it('should findAll', async function () {
    const query = {name: 'John'};
    const props = [{id: 1, name: 'John'}];
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
          callCount++;
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const users = await store.findAll('user', query);
    expect(callCount).toEqual(1);
    expect(
      typeof store._completedQueries.user[store.hashQuery('user', query)]
    ).toEqual('function');
    expect(users).toEqual(props);
    expect(users[0] instanceof User.recordClass).toBeTruthy();
    expect(await store.findAll('user', query)).toEqual(users);
    expect(callCount).toEqual(1);
    expect(await store.findAll('user', query, {force: true})).toEqual(props);
    expect(callCount).toEqual(2);
    expect(await store.findAll('user', query)).toEqual(props);
    expect(callCount).toEqual(2);
  });
  it('should findAll with scoped store', async function () {
    const query = {name: 'John'};
    const props = [{id: 1, name: 'John'}];
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
          callCount++;
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const scopedStore = store.as('user');
    const users = await scopedStore.findAll(query);
    expect(callCount).toEqual(1);
    expect(typeof scopedStore._completedQueries.user[scopedStore.hashQuery(query)]).toEqual('function');
    expect(users).toEqual(props);
    expect(users[0] instanceof User.recordClass).toBeTruthy();
    expect(await scopedStore.findAll(query)).toEqual(users);
    expect(callCount).toEqual(1);
    expect(await scopedStore.findAll(query, {force: true})).toEqual(props);
    expect(callCount).toEqual(2);
    expect(await scopedStore.findAll(query)).toEqual(props);
    expect(callCount).toEqual(2);
    expect(scopedStore.getAll().length).toEqual(1);
  });
  it('should return pending query', async function () {
    const query = {name: 'John'};
    const props = [{id: 1, name: 'John'}];
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
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
    const results = await Promise.all([store.findAll('user', query), store.findAll('user', query)]);
    expect(callCount).toEqual(1);
    expect(results[0]).toEqual(props);
    expect(results[1]).toEqual(props);
    expect(results[0][0]).toBe(results[1][0]);
  });
  it('should delete pending query on error', function () {
    const query = {name: 'John'};
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
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
    const pendingQuery = store.findAll('user', query);
    expect(store._pendingQueries.user[store.hashQuery('user', query)]).toBeTruthy();
    return pendingQuery.catch(err => {
      expect(callCount).toEqual(1);
      expect(!store._pendingQueries.user[store.hashQuery('user', query)]).toBeTruthy();
      expect(err.message).toEqual('foo');
    });
  });
});
