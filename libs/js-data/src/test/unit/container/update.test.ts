import { JSData } from '../../_setup';

describe('Container#update', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.update).toEqual('function');
    expect(store.update).toBe(Container.prototype.update);
  });
});
