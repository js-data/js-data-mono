import { JSData } from '../../_setup';

describe('DataStore#defineMapper', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.defineMapper).toEqual('function');
    expect(store.defineMapper).toBe(DataStore.prototype.defineMapper);
  });
  it('should create indexes for indexed properties', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user', {
      schema: {
        properties: {
          id: {type: 'number'},
          age: {indexed: true},
          role: {indexed: true}
        }
      }
    });
    store.add('user', [
      {id: 2, age: 18, role: 'admin'},
      {id: 3, age: 19, role: 'dev'},
      {id: 9, age: 19, role: 'admin'},
      {id: 6, age: 19, role: 'owner'},
      {id: 4, age: 22, role: 'dev'},
      {id: 1, age: 23, role: 'owner'}
    ]);

    expect(store.getAll('user', 19, {index: 'age'}).map(user => {
      return user.toJSON();
    })).toEqual([
      {id: 3, age: 19, role: 'dev'},
      {id: 6, age: 19, role: 'owner'},
      {id: 9, age: 19, role: 'admin'}
    ]);
  });
  it('can get a scoped reference', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    const fooMapper = store.defineMapper('foo');
    const fooStore = store.as('foo');

    expect(fooStore._adapters).toBe(store._adapters);
    expect(fooStore._mappers).toBe(store._mappers);
    expect(fooStore._collections).toBe(store._collections);
    expect(fooStore._listeners).toBe(store._listeners);
    expect(fooStore.getMapper()).toBe(store.getMapper('foo'));
    expect(fooStore.getCollection()).toBe(store.getCollection('foo'));
    expect(fooStore.createRecord({foo: 'bar'})).toEqual(store.createRecord('foo', {foo: 'bar'}));
    expect(fooMapper).toBe(store.getMapper('foo'));
    expect(fooStore.getMapper()).toBe(store.getMapper('foo'));
  });
});
