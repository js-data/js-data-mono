import { $$adapter, $$User, debug, objectsEqual } from './index';
import * as sinon from 'sinon';

describe('Adapter#afterUpdate', () => {
  it('should call afterUpdate', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon
      .stub(adapter, 'afterUpdate')
      .callsFake(async (mapper, id, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterUpdate');
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

    expect(adapter.afterUpdate.calledOnce).toBe(true);

    const args = adapter.afterUpdate.firstCall.args;
    expect(args.length).toEqual(5);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'afterUpdate should have received update props'
    );
    expect(args[3]).toBeDefined();
    expect(args[3].op).toEqual('afterUpdate');
    expect(args[4]).toBeDefined();
    expect(args[4][User.idAttribute]).toEqual(userId);
    expect(args[4].name).toEqual('Johnny');
    adapter.afterUpdate.restore();
  });
  it('should receive raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon
      .stub(adapter, 'afterUpdate')
      .callsFake(async (mapper, id, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterUpdate');
      });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    const userId = user[User.idAttribute];
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, userId, {name: 'Johnny'});
    const result = await adapter.update(
      User,
      userId,
      {name: 'Johnny'},
      {raw: true}
    );
    debug('updated', User.name, result);
    expect(result.data).toBeDefined();
    expect(result.data.name).toEqual('Johnny');
    expect(result.data[User.idAttribute]).toEqual(userId);

    expect(adapter.afterUpdate.calledOnce).toBe(true);

    const args = adapter.afterUpdate.firstCall.args;
    expect(args.length).toEqual(5);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'afterUpdate should have received update props'
    );
    expect(args[3]).toBeDefined();
    expect(args[3].op).toEqual('afterUpdate');
    expect(args[4]).toBeDefined();
    expect(args[4].updated).toEqual(1);
    expect(args[4].data).toBeDefined();
    expect(args[4].data[User.idAttribute]).toEqual(userId);
    expect(args[4].data.name).toEqual('Johnny');
    adapter.afterUpdate.restore();
  });
  it('should allow re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon
      .stub(adapter as any, 'afterUpdate')
      .callsFake(async (mapper, id, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterUpdate');
        return 'foo';
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
    expect(updatedUser).toEqual('foo');

    expect(adapter.afterUpdate.calledOnce).toBe(true);

    const args = adapter.afterUpdate.firstCall.args;
    expect(args.length).toEqual(5);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'afterUpdate should have received update props'
    );
    expect(args[3]).toBeDefined();
    expect(args[3].op).toEqual('afterUpdate');
    expect(args[4]).toBeDefined();
    expect(args[4][User.idAttribute]).toEqual(userId);
    expect(args[4].name).toEqual('Johnny');
    adapter.afterUpdate.restore();
  });
  it('should allow returning a promise', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'afterUpdate').callsFake((mapper, id, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('afterUpdate');
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

    expect(adapter.afterUpdate.calledOnce).toBe(true);

    const args = adapter.afterUpdate.firstCall.args;
    expect(args.length).toEqual(5);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'afterUpdate should have received update props'
    );
    expect(args[3]).toBeDefined();
    expect(args[3].op).toEqual('afterUpdate');
    expect(args[4]).toBeDefined();
    expect(args[4][User.idAttribute]).toEqual(userId);
    expect(args[4].name).toEqual('Johnny');
    adapter.afterUpdate.restore();
  });
  it('should allow returning a promise and re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon
      .stub(adapter, 'afterUpdate')
      .callsFake(async (mapper, id, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterUpdate');
        return 'foo';
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
    expect(updatedUser).toEqual('foo');

    expect(adapter.afterUpdate.calledOnce).toBe(true);

    const args = adapter.afterUpdate.firstCall.args;
    expect(args.length).toEqual(5);
    expect(args[0] === User).toBe(true);
    expect(args[1] === userId).toBe(true);
    objectsEqual(
      args[2],
      {name: 'Johnny'},
      'afterUpdate should have received update props'
    );
    expect(args[3]).toBeDefined();
    expect(args[3].op).toEqual('afterUpdate');
    expect(args[4]).toBeDefined();
    expect(args[4][User.idAttribute]).toEqual(userId);
    expect(args[4].name).toEqual('Johnny');
    adapter.afterUpdate.restore();
  });
});
