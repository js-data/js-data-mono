import { JSData } from '../../_setup';

describe('Container#getMapper', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.getMapper).toEqual('function');
    expect(store.getMapper).toBe(Container.prototype.getMapper);
  });
  it('should return the specified mapper', () => {
    const Container = JSData.Container;
    const container = new Container();
    const foo = container.defineMapper('foo');
    expect(foo).toBe(container.getMapper('foo'));
    expect(() => {
      container.getMapper('bar');
    }).toThrow();
  });
});
