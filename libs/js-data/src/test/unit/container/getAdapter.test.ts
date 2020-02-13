import { JSData } from '../../_setup';

describe('Container#getAdapter', () => {
  it('should get an adapter', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.getAdapter).toEqual('function');
    expect(store.getAdapter).toBe(Container.prototype.getAdapter);

    const adapter = {};
    store.registerAdapter('foo', adapter);
    expect(store.getAdapter('foo') === adapter).toEqual(true);
    expect(() => {
      store.getAdapter();
    }).toThrow();
  });
});
