import { JSData } from '../../_setup';

describe('Container#createRecord', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.createRecord).toEqual('function');
    expect(store.createRecord).toBe(Container.prototype.createRecord);
  });
});
