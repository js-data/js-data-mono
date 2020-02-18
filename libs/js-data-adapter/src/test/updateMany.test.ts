import { $$adapter, $$User, objectsEqual } from './index';

describe('Adapter#updateMany', () => {
  it('should update multiple users', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const user1 = await adapter.create(User, {name: 'John', age: 20});
    const userId1 = user1.id;

    const user2 = await adapter.create(User, {name: 'John', age: 30});
    const userId2 = user2.id;

    const users = await adapter.findAll(User, {name: 'John'});
    users.sort((a, b) => {
      return a.age - b.age;
    });
    expect(users[0].name).toEqual('John');
    expect(users[0].name).toEqual('John');
    expect(users.filter(x => x.id === userId1).length).toEqual(1);
    expect(users.filter(x => x.id === userId2).length).toEqual(1);
    expect(users.filter(x => x.age === 20).length).toEqual(1);
    expect(users.filter(x => x.age === 30).length).toEqual(1);

    user1.age = 101;
    user2.age = 202;
    const users2 = await adapter.updateMany(User, [user1, user2]);
    users2.sort((a, b) => a.age - b.age);
    expect(users2.filter(x => x.id === userId1).length).toEqual(1);
    expect(users2.filter(x => x.id === userId2).length).toEqual(1);
    expect(users2.filter(x => x.age === 101).length).toEqual(1);
    expect(users2.filter(x => x.age === 202).length).toEqual(1);

    const users3 = await adapter.findAll(User, {age: 20});
    objectsEqual(users3, []);
    expect(users3.length).toEqual(0);

    const users4 = await adapter.findAll(User, {age: 101});
    users4.sort((a, b) => a.age - b.age);
    expect(users4.filter(x => x.id === userId1).length).toEqual(1);
    expect(users4.filter(x => x.id === userId2).length).toEqual(0);
    expect(users4.filter(x => x.age === 101).length).toEqual(1);
    expect(users4.filter(x => x.age === 202).length).toEqual(0);
  });
});
