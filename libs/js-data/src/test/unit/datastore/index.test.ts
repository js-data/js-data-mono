import { JSData, sinon } from '../../_setup';

describe('DataStore', () => {
  it('should be a constructor function', () => {
    const DataStore = JSData.DataStore;
    expect(typeof DataStore).toEqual('function');
    const store = new DataStore();
    expect(store instanceof DataStore).toBeTruthy();
    expect(JSData.utils.getSuper(store)).toBe(JSData.SimpleStore);
  });
  it('should initialize with defaults', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(store._adapters).toEqual({});
    expect(store._mappers).toEqual({});
    expect(store._collections).toEqual({});
    expect(store.mapperDefaults).toEqual({});
    expect(store.mapperClass).toBe(JSData.Mapper);
    expect(store.collectionClass).toBe(JSData.LinkedCollection);
  });
  it('should accept overrides', () => {
    const DataStore = JSData.DataStore;

    class Foo {}

    // tslint:disable-next-line:max-classes-per-file
    class Bar {}

    const store = new DataStore({
      mapperClass: Foo,
      collectionClass: Bar,
      foo: 'bar',
      linkRelations: true,
      mapperDefaults: {
        idAttribute: '_id'
      }
    });
    expect(store._adapters).toEqual({});
    expect(store._mappers).toEqual({});
    expect(store._collections).toEqual({});
    expect(store.foo).toEqual('bar');
    expect(store.mapperDefaults).toEqual({
      idAttribute: '_id'
    });
    expect(store.mapperClass).toBe(Foo);
    expect(store.collectionClass).toBe(Bar);
    expect(store.linkRelations).toBeTruthy();
  });
  it('should have events', () => {
    const store = new JSData.DataStore();
    const listener = sinon.stub();
    store.on('bar', listener);
    store.emit('bar');
    expect(listener.calledOnce).toBeTruthy();
  });
  it('should proxy Mapper events', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('bar', listener);
    store.getMapper('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['user', 'foo']);
  });
  it('should proxy all Mapper events', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('all', listener);
    store.getMapper('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['bar', 'user', 'foo']);
  });
  it('should proxy Collection events', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('bar', listener);
    store.getCollection('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['user', 'foo']);
  });
  it('should proxy all Collection events', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('all', listener);
    store.getCollection('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['bar', 'user', 'foo']);
  });
});
