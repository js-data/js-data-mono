import { $$adapter, $$User, debug } from './index';

describe('Adapter#createMany', () => {
  it('should create multiple users', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const user1 = {name: 'John', age: 20};

    const user2 = {name: 'John', age: 30};

    debug('createMany', User.name, [user1, user2]);
    const users = await adapter.createMany(User, [user1, user2]);
    debug('created', User.name, users);
    users.sort((a, b) => {
      return a.age - b.age;
    });
    expect(users[0][User.idAttribute]).toBeDefined();
    expect(users[1][User.idAttribute]).toBeDefined();
    expect(users.filter(x => x.age === 20).length).toEqual(1);
    expect(users.filter(x => x.age === 30).length).toEqual(1);

    debug('findAll', User.name, {age: 20});
    const users3 = await adapter.findAll(User, {age: 20});
    debug('found', User.name, users3);
    expect(users3.length).toEqual(1);
  });
});
