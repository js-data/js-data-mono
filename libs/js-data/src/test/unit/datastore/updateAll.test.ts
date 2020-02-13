import { JSData, store } from '../../_setup';

describe('DataStore#updateAll', () => {
  it('should updateAll', async () => {
    const query = {name: 'John'};
    const props: any = [{id: 1, name: 'John'}];
    store.registerAdapter(
      'mock',
      {
        updateAll() {
          props[0].foo = 'bar';
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const users = await store.updateAll('user', props, query);
    expect(users[0].foo).toEqual('bar');
    expect(users[0] instanceof store.getMapper('user').recordClass).toBeTruthy();
  });
});
