import { JSData } from '../../_setup';

describe('Container#registerAdapter', () => {
  it('should register an adapter', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.registerAdapter).toEqual('function');
    expect(store.registerAdapter).toBe(Container.prototype.registerAdapter);

    store.defineMapper('user');

    store.registerAdapter('foo', {}, {default: true});
    store.registerAdapter('bar', {});
    expect(store.getAdapters()).toEqual({
      foo: {},
      bar: {}
    });
    const mapper = store.defineMapper('foo');
    expect(mapper.getAdapters()).toEqual({
      foo: {},
      bar: {}
    });
    expect(store.mapperDefaults.defaultAdapter).toEqual('foo');
  });
});
