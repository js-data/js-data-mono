import { JSData } from '../../_setup';

describe('Container#getAdapters', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.getAdapters).toEqual('function');
    expect(store.getAdapters).toBe(Container.prototype.getAdapters);
  });
  it('should return the adapters of the container', () => {
    const Container = JSData.Container;
    const container = new Container();
    expect(container.getAdapters()).toBe(container._adapters);
  });
});
