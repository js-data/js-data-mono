import { JSData } from '../../_setup';

describe('Container#destroy', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.destroy).toEqual('function');
    expect(store.destroy).toBe(Container.prototype.destroy);
  });
});
