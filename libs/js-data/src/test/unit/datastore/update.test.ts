import { JSData, store } from '../../_setup';

describe('DataStore#update', () => {
  it('should update', async function () {
    const id = 1;
    const props: any = {id, name: 'John'};
    store.registerAdapter(
      'mock',
      {
        update() {
          props.foo = 'bar';
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const user = await store.update('user', id, props);
    expect(user.foo).toEqual('bar');
    expect(user instanceof store.getMapper('user').recordClass).toBeTruthy();
  });
});
