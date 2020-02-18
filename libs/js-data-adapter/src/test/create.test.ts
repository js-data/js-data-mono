import { $$adapter, $$User, debug } from './index';

describe('Adapter#create', () => {
  it('should create a user', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('find', User.name, userId);
    const foundUser = await adapter.find(User, userId);
    debug('found', User.name, foundUser);

    expect(foundUser.name).toEqual(props.name);
    expect(foundUser[User.idAttribute]).toBeDefined();
    expect(foundUser[User.idAttribute]).toEqual(userId);
  });
});
