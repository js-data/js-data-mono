import { $$adapter, $$User, debug } from './index';

describe('Adapter#destroyAll', () => {
  it('should destroy all users', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    debug('create', User.name, {name: 'Sally'});
    const user2 = await adapter.create(User, {name: 'Sally'});
    debug('created', User.name, user2);

    debug('findAll', User.name, {name: 'John'});
    let foundUsers = await adapter.findAll(User, {name: 'John'});
    debug('found', User.name, foundUsers);
    expect(foundUsers.length).toEqual(1);
    expect(foundUsers[0][User.idAttribute]).toEqual(userId);
    expect(foundUsers[0].name).toEqual('John');

    debug('destroyAll', User.name, {name: 'John'});
    const destroyedUsers = await adapter.destroyAll(User, {name: 'John'});
    debug('destroyed', User.name, destroyedUsers);
    expect(destroyedUsers).not.toBeDefined();

    debug('findAll', User.name, {name: 'John'});
    foundUsers = await adapter.findAll(User, {name: 'John'});
    debug('found', User.name, foundUsers);
    expect(foundUsers.length).toEqual(0);

    debug('findAll', User.name, {});
    foundUsers = await adapter.findAll(User, {});
    debug('found', User.name, foundUsers);
    expect(foundUsers.length).toEqual(1);
  });
  it('should destroy users and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    debug('destroyAll', User.name, props);
    const result = await adapter.destroyAll(User, props, {raw: true});
    debug('destroyed', User.name, result);
    expect(result.data).not.toBeDefined();
    if (Object.prototype.hasOwnProperty.call(result, 'deleted')) {
      expect(result.deleted).toBeDefined();
      expect(result.deleted).toEqual(1);
    }
  });
  it('should destroy nothing', async () => {
    const adapter = $$adapter;
    const User = $$User;

    debug('destroyAll', User.name, {});
    const result = await adapter.destroyAll(User, {});
    debug('destroyed', User.name, result);
    expect(result).not.toBeDefined();
  });
  it('should destroy nothing and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;

    debug('destroyAll', User.name, {});
    const result = await adapter.destroyAll(User, {}, {raw: true});
    debug('destroyed', User.name, result);
    expect(result.data).not.toBeDefined();
    if (Object.prototype.hasOwnProperty.call(result, 'deleted')) {
      expect(result.deleted).toBeDefined();
      expect(result.deleted).toEqual(0);
    }
  });
});
