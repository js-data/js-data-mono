import { data, JSData, store } from '../../_setup';

describe('DataStore#destroy', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.destroy).toEqual('function');
    expect(store.destroy).toBe(DataStore.prototype.destroy);
  });
  it('should destroy', async function () {
    const id = 1;
    let destroyCalled;
    store._pendingQueries.user[id] = new Date().getTime();
    store._completedQueries.user[id] = new Date().getTime();
    const user = store.add('user', {id, name: 'John'});
    store.registerAdapter(
      'mock',
      {
        destroy() {
          destroyCalled = true;
          return Promise.resolve();
        }
      },
      {default: true}
    );
    const result = await store.destroy('user', id);
    expect(destroyCalled).toBeTruthy();
    expect(!store._pendingQueries.user[id]).toBeTruthy();
    expect(!store._completedQueries.user[id]).toBeTruthy();
    expect(!store.get('user', id)).toBeTruthy();
    expect(result).toBe(user);
  });
  it('should return raw', async function () {
    const id = 1;
    let destroyCalled;
    store._pendingQueries.user[id] = new Date().getTime();
    store._completedQueries.user[id] = new Date().getTime();
    const user = store.add('user', {id, name: 'John'});
    store.registerAdapter(
      'mock',
      {
        destroy() {
          destroyCalled = true;
          return Promise.resolve({
            deleted: 1
          });
        }
      },
      {default: true}
    );
    const result = await store.destroy('user', id, {raw: true});
    expect(destroyCalled).toBeTruthy();
    expect(!store._pendingQueries.user[id]).toBeTruthy();
    expect(!store._completedQueries.user[id]).toBeTruthy();
    expect(!store.get('user', id)).toBeTruthy();
    expect(result.adapter).toEqual('mock');
    expect(result.deleted).toEqual(1);
    expect(result.data).toBe(user);
  });
  it('should destroy and unlink relations', async function () {
    const id = data.user10.id;
    let destroyCalled;
    store._pendingQueries.user[id] = new Date().getTime();
    store._completedQueries.user[id] = new Date().getTime();
    store.registerAdapter(
      'mock',
      {
        destroy() {
          destroyCalled = true;
          return Promise.resolve();
        }
      },
      {default: true}
    );

    const user = store.add('user', data.user10);
    expect(store.get('profile', data.profile15.id).user).toBe(user);
    expect(store.get('organization', data.organization14.id).users[0]).toBe(user);
    expect(store.get('comment', data.comment11.id).user).toBe(user);
    expect(store.get('comment', data.comment12.id).user).toBe(user);
    expect(store.get('comment', data.comment13.id).user).toBe(user);

    const result = await store.destroy('user', user.id);
    expect(destroyCalled).toBeTruthy();
    expect(store.get('profile', data.profile15.id).user).toEqual(undefined);
    expect(store.get('organization', data.organization14.id).users[0]).toEqual(undefined);
    expect(store.get('comment', data.comment11.id).user).toEqual(undefined);
    expect(store.get('comment', data.comment12.id).user).toEqual(undefined);
    expect(store.get('comment', data.comment13.id).user).toEqual(undefined);
    expect(store._pendingQueries.user[id]).toEqual(undefined);
    expect(store._completedQueries.user[id]).toEqual(undefined);
    expect(store.get('user', id)).toEqual(undefined);
    expect(result).toBe(user);
  });
});
