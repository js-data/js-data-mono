import { $$adapter, $$User, debug, equalObjects } from './index';

describe('Adapter#updateAll', () => {
  it('should update multiple users', async () => {
    const adapter = $$adapter;
    const User = $$User;
    let props = {name: 'John', age: 20};

    debug('create', User.name, props);
    const user1 = await adapter.create(User, props);
    debug('created', User.name, user1);
    const userId1 = user1[User.idAttribute];

    props = {name: 'John', age: 30};

    debug('create', User.name, props);
    const user2 = await adapter.create(User, props);
    debug('created', User.name, user2);
    const userId2 = user2[User.idAttribute];

    debug('findAll', User.name, {name: 'John'});
    const users = await adapter.findAll(User, {name: 'John'});
    debug('found', User.name, users);
    users.sort((a, b) => {
      return a.age - b.age;
    });
    expect(users[0].name).toEqual('John');
    expect(users[0].name).toEqual('John');
    expect(users.filter(x => x[User.idAttribute] === userId1).length).toEqual(
      1
    );
    expect(users.filter(x => x[User.idAttribute] === userId2).length).toEqual(
      1
    );
    expect(users.filter(x => x.age === 20).length).toEqual(1);
    expect(users.filter(x => x.age === 30).length).toEqual(1);

    debug('updateAll', User.name, {name: 'Johnny'}, {name: 'John'});
    const users2 = await adapter.updateAll(
      User,
      {name: 'Johnny'},
      {name: 'John'}
    );
    debug('updated', User.name, users2);
    users2.sort((a, b) => a.age - b.age);
    expect(users2[0].name).toEqual('Johnny');
    expect(users2[0].name).toEqual('Johnny');
    expect(users2.filter(x => x[User.idAttribute] === userId1).length).toEqual(
      1
    );
    expect(users2.filter(x => x[User.idAttribute] === userId2).length).toEqual(
      1
    );
    expect(users2.filter(x => x.age === 20).length).toEqual(1);
    expect(users2.filter(x => x.age === 30).length).toEqual(1);

    debug('findAll', User.name, {name: 'John'});
    const users3 = await adapter.findAll(User, {name: 'John'});
    debug('found', User.name, users3);
    equalObjects(users3, []);
    expect(users3.length).toEqual(0);

    debug('findAll', User.name, {name: 'Johnny'});
    const users4 = await adapter.findAll(User, {name: 'Johnny'});
    debug('found', User.name, users4);

    users4.sort((a, b) => {
      return a.age - b.age;
    });
    expect(users4[0].name).toEqual('Johnny');
    expect(users4[0].name).toEqual('Johnny');
    expect(users4.filter(x => x[User.idAttribute] === userId1).length).toEqual(
      1
    );
    expect(users4.filter(x => x[User.idAttribute] === userId2).length).toEqual(
      1
    );
    expect(users4.filter(x => x.age === 20).length).toEqual(1);
    expect(users4.filter(x => x.age === 30).length).toEqual(1);
  });
});
