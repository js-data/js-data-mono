import { JSData } from '../../_setup';

describe('Container#createMany', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.createMany).toEqual('function');
    expect(store.createMany).toBe(Container.prototype.createMany);
  });
});
