import { UserCollection } from '../../_setup';

describe('LinkedCollection#remove', () => {
  it('should remove an item from the collection', function () {
    UserCollection.createIndex('age');
    const user = UserCollection.add({id: 1, age: 30});
    const user2 = UserCollection.add({id: 2, age: 31});
    const user3 = UserCollection.add({id: 3, age: 32});
    const users = [user, user2, user3];
    expect(UserCollection.get(1)).toBe(user);
    expect(UserCollection.get(2)).toBe(user2);
    expect(UserCollection.get(3)).toBe(user3);
    expect(UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    })).toEqual(users);
    UserCollection.remove(1);
    expect(!UserCollection.get(1)).toBeTruthy();
    users.shift();
    expect(UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    })).toEqual(users);
  });
});
