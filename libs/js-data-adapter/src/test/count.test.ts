import { $$adapter, $$User, debug } from './index';

describe('Adapter#count', () => {
  it('should count users', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('count', User.name, {});
    let count = await adapter.count(User);
    debug('counted', User.name, count);
    expect(count).toEqual(0);

    debug('count', User.name, {name: 'John'});
    count = await adapter.count(User, {name: 'John'});
    debug('counted', User.name, count);
    expect(count).toEqual(0);

    debug('count', User.name, {name: 'Sally'});
    count = await adapter.count(User, {name: 'Sally'});
    debug('counted', User.name, count);
    expect(count).toEqual(0);

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    debug('count', User.name, {});
    count = await adapter.count(User);
    debug('counted', User.name, count);
    expect(count).toEqual(1);

    debug('count', User.name, {name: 'John'});
    count = await adapter.count(User, {name: 'John'});
    debug('counted', User.name, count);
    expect(count).toEqual(1);

    debug('count', User.name, {name: 'Sally'});
    count = await adapter.count(User, {name: 'Sally'});
    debug('counted', User.name, count);
    expect(count).toEqual(0);

    debug('create', User.name, {name: 'Sally'});
    const user2 = await adapter.create(User, {name: 'Sally'});
    debug('created', User.name, user2);

    debug('count', User.name, {});
    count = await adapter.count(User);
    debug('counted', User.name, count);
    expect(count).toEqual(2);

    debug('count', User.name, {name: 'John'});
    count = await adapter.count(User, {name: 'John'});
    debug('counted', User.name, count);
    expect(count).toEqual(1);

    debug('count', User.name, {name: 'Sally'});
    count = await adapter.count(User, {name: 'Sally'});
    debug('counted', User.name, count);
    expect(count).toEqual(1);
  });
  it('should count users and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    debug('count', User.name, props);
    const result = await adapter.count(User, props, {raw: true});
    debug('counted', User.name, result);
    expect(result.data).toEqual(1);
  });
});
