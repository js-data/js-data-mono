import * as sinon from 'sinon';
import { $$adapter, $$User, debug, objectsEqual } from './index';

describe('Adapter#beforeUpdate', () => {
  it('should call beforeUpdate', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeUpdate').callsFake((mapper, id, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeUpdate');
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, userId, {name: 'Johnny'});
    const updatedUser = await adapter.update(User, userId, {name: 'Johnny'});
    debug('updated', User.name, updatedUser);
    expect(updatedUser.name).toEqual('Johnny');
    expect(updatedUser[User.idAttribute]).toEqual(userId);

    expect(adapter.beforeUpdate.calledOnce).toBe(true);

    const args = adapter.beforeUpdate.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'beforeUpdate should have received update props'
    );
    expect(typeof args[3]).toBe('object');
    adapter.beforeUpdate.restore();
  });
  it('should allow re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeUpdate').callsFake((mapper, id, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeUpdate');
      return {name: 'Sally'};
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, userId, {name: 'Johnny'});
    const updatedUser = await adapter.update(User, userId, {name: 'Johnny'});
    debug('updated', User.name, updatedUser);
    expect(updatedUser.name).toEqual('Sally');
    expect(updatedUser[User.idAttribute]).toEqual(userId);

    expect(adapter.beforeUpdate.calledOnce).toBe(true);

    const args = adapter.beforeUpdate.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'beforeUpdate should have received update props'
    );
    expect(typeof args[3]).toBe('object');
    adapter.beforeUpdate.restore();
  });
  it('should allow returning a promise', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeUpdate').callsFake((mapper, id, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeUpdate');
      return Promise.resolve();
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, userId, {name: 'Johnny'});
    const updatedUser = await adapter.update(User, userId, {name: 'Johnny'});
    debug('updated', User.name, updatedUser);
    expect(updatedUser.name).toEqual('Johnny');
    expect(updatedUser[User.idAttribute]).toEqual(userId);

    expect(adapter.beforeUpdate.calledOnce).toBe(true);

    const args = adapter.beforeUpdate.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'beforeUpdate should have received update props'
    );
    expect(typeof args[3]).toBe('object');
    adapter.beforeUpdate.restore();
  });
  it('should allow returning a promise and re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeUpdate').callsFake((mapper, id, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeUpdate');
      return Promise.resolve({name: 'Sally'});
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, userId, {name: 'Johnny'});
    const updatedUser = await adapter.update(User, userId, {name: 'Johnny'});
    debug('updated', User.name, updatedUser);
    expect(updatedUser.name).toEqual('Sally');
    expect(updatedUser[User.idAttribute]).toEqual(userId);

    expect(adapter.beforeUpdate.calledOnce).toBe(true);

    const args = adapter.beforeUpdate.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'beforeUpdate should have received update props'
    );
    expect(typeof args[3]).toBe('object');
    adapter.beforeUpdate.restore();
  });
});
