import { $$adapter, $$User, debug } from './index';

describe('Adapter#sum', () => {
  it('should exist', () => {
    expect(typeof $$adapter.sum).toEqual('function');
  });
  it("should sum users' age", async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John', age: 30};

    debug('sum', User.name, {});
    let sum = await adapter.sum(User, 'age');
    debug('summed', User.name, sum);
    expect(sum).toEqual(0);

    debug('sum', User.name, {name: 'John'});
    sum = await adapter.sum(User, 'age', {name: 'John'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(0);

    debug('sum', User.name, {name: 'Sally'});
    sum = await adapter.sum(User, 'age', {name: 'Sally'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(0);

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    debug('sum', User.name, {});
    sum = await adapter.sum(User, 'age');
    debug('summed', User.name, sum);
    expect(sum).toEqual(30);

    debug('sum', User.name, {name: 'John'});
    sum = await adapter.sum(User, 'age', {name: 'John'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(30);

    debug('sum', User.name, {name: 'Sally'});
    sum = await adapter.sum(User, 'age', {name: 'Sally'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(0);

    debug('create', User.name, {name: 'Sally'});
    const user2 = await adapter.create(User, {name: 'Sally', age: 27});
    debug('created', User.name, user2);

    debug('sum', User.name, {});
    sum = await adapter.sum(User, 'age');
    debug('summed', User.name, sum);
    expect(sum).toEqual(57);

    debug('sum', User.name, {name: 'John'});
    sum = await adapter.sum(User, 'age', {name: 'John'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(30);

    debug('sum', User.name, {name: 'Sally'});
    sum = await adapter.sum(User, 'age', {name: 'Sally'});
    debug('summed', User.name, sum);
    expect(sum).toEqual(27);
  });
  it("should sum users' age and return raw", async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John', age: 30};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    debug('sum', User.name, props);
    const result = await adapter.sum(User, 'age', props, {raw: true});
    debug('summed', User.name, result);
    expect(result.data).toEqual(30);
  });
});
