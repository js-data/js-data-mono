import { JSData } from '../../_setup';

describe('Container#destroyAll', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.destroyAll).toEqual('function');
    expect(store.destroyAll).toBe(Container.prototype.destroyAll);
  });
});
