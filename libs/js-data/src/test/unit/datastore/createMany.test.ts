import { JSData, store } from '../../_setup';

describe('DataStore#createMany', () => {
  it('should createMany', async function () {
    const props: any = [{name: 'John'}];
    store.registerAdapter(
      'mock',
      {
        createMany() {
          props[0].id = 1;
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const users = await store.createMany('user', props);
    expect(users[0][store.getMapper('user').idAttribute]).toBeTruthy();
    expect(users[0] instanceof store.getMapper('user').recordClass).toBeTruthy();
  });
});
