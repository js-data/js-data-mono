import { JSData } from '../../_setup';

describe('Container#create', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.create).toEqual('function');
    expect(store.create).toBe(Container.prototype.create);
  });
});
