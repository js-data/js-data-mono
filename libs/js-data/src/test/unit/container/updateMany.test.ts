import { JSData } from '../../_setup';

describe('Container#updateMany', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.updateMany).toEqual('function');
    expect(store.updateMany).toBe(Container.prototype.updateMany);
  });
});
