import { JSData } from '../../_setup';

describe('Container#find', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.find).toEqual('function');
    expect(store.find).toBe(Container.prototype.find);
  });
});
