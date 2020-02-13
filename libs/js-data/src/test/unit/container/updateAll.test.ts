import { JSData } from '../../_setup';

describe('Container#updateAll', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.updateAll).toEqual('function');
    expect(store.updateAll).toBe(Container.prototype.updateAll);
  });
});
