import { JSData } from '../../_setup';

describe('Container#findAll', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.findAll).toEqual('function');
    expect(store.findAll).toBe(Container.prototype.findAll);
  });
});
