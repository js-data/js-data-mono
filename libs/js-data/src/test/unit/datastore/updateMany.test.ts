import { JSData, store } from '../../_setup';

describe('DataStore#updateMany', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore;
    const store = new DataStore();
    expect(typeof store.updateMany).toEqual('function');
    expect(store.updateMany).toBe(DataStore.prototype.updateMany);
  });
  it('should updateMany', async function () {
    const props: any = [{id: 1, name: 'John'}];
    store.registerAdapter(
      'mock',
      {
        updateMany() {
          props[0].foo = 'bar';
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const users = await store.updateMany('user', props);
    expect(users[0].foo).toEqual('bar');
    expect(users[0] instanceof store.getMapper('user').recordClass).toBeTruthy();
  });
});
