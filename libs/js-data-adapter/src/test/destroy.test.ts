import { $$adapter, $$User, debug } from './index';

describe('Adapter#destroy', () => {
  it('should destroy a user', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    let beforeDestroyCalled = false;
    let afterDestroyCalled = false;

    // Test beforeDestroy and afterDestroy
    adapter.beforeDestroy = (mapper, id, opts) => {
      beforeDestroyCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(typeof opts).toBe('object');
      // Test re-assignment
      return Promise.resolve();
    };
    adapter.afterDestroy = (mapper, id, opts) => {
      afterDestroyCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(typeof opts).toBe('object');
      // Test re-assignment
      return Promise.resolve();
    };

    debug('destroy', User.name, userId);
    const destroyedUser = await adapter.destroy(User, userId);
    debug('destroyed', User.name, destroyedUser);
    expect(destroyedUser).not.toBeDefined();
    expect(beforeDestroyCalled).toBe(true);
    expect(afterDestroyCalled).toBe(true);
  });
  it('should destroy a user and allow afterDestroy re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    let beforeDestroyCalled = false;
    let afterDestroyCalled = false;

    // Test beforeDestroy and afterDestroy
    adapter.beforeDestroy = (mapper, id, opts) => {
      beforeDestroyCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(typeof opts).toBe('object');
      // Test re-assignment
      return Promise.resolve();
    };
    adapter.afterDestroy = (mapper, id, opts) => {
      afterDestroyCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(typeof opts).toBe('object');
      // Test re-assignment
      return Promise.resolve('foo');
    };

    debug('destroy', User.name, userId);
    const destroyedUser = await adapter.destroy(User, userId, {raw: true});
    debug('destroyed', User.name, destroyedUser);
    expect(destroyedUser).toEqual('foo');
    expect(beforeDestroyCalled).toBe(true);
    expect(afterDestroyCalled).toBe(true);
  });
  it('should destroy a user and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    debug('destroy', User.name, userId);
    const result = await adapter.destroy(User, userId, {raw: true});
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

    debug('destroy', User.name, 'non-existent-id');
    const result = await adapter.destroy(User, 'non-existent-id');
    debug('destroyed', User.name, result);
    expect(result).not.toBeDefined();
  });
  it('should destroy nothing and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;

    debug('destroy', User.name, 'non-existent-id');
    const result = await adapter.destroy(User, 'non-existent-id', {
      raw: true
    });
    debug('destroyed', User.name, result);
    expect(result.data).not.toBeDefined();
    if (Object.prototype.hasOwnProperty.call(result, 'deleted')) {
      expect(result.deleted).toBeDefined();
      expect(result.deleted).toEqual(0);
    }
  });
});
