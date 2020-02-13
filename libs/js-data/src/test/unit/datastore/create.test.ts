import { JSData, store } from '../../_setup';

describe('DataStore#create', () => {
  it('should create', async function () {
    const props: any = {name: 'John'};
    store.registerAdapter(
      'mock',
      {
        create() {
          props.id = 1;
          return JSData.utils.resolve(props);
        }
      },
      {default: true}
    );
    const user = await store.create('user', props);
    expect(user[store.getMapper('user').idAttribute]).toBeTruthy();
    expect(user instanceof store.getMapper('user').recordClass).toBeTruthy();
  });
});
