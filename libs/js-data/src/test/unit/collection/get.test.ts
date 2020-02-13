import { UserCollection } from '../../_setup';

describe('Collection#get', () => {
  it('should get an item from the collection', function () {
    const user = UserCollection.add({id: 1});
    expect(UserCollection.get(1) === user).toBeTruthy();
    expect(!UserCollection.get(2)).toBeTruthy();
    console.log('!UserCollection.get(): ', UserCollection.get());
    expect(!UserCollection.get()).toBeTruthy();
  });
});
