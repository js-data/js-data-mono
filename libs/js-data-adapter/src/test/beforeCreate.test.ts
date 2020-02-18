import * as sinon from 'sinon';
import { $$adapter, $$User, debug, objectsEqual } from './index';

describe('Adapter#beforeCreate', () => {
  it('should call beforeCreate', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeCreate').callsFake((mapper, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeCreate');
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    expect(adapter.beforeCreate.calledOnce).toBe(true);

    const args = adapter.beforeCreate.firstCall.args;
    expect(args.length).toEqual(3);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'beforeCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    adapter.beforeCreate.restore();
  });
  it('should allow re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeCreate').callsFake((mapper, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeCreate');
      return {name: 'Sally'};
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual('Sally');
    expect(user[User.idAttribute]).toBeDefined();

    expect(adapter.beforeCreate.calledOnce).toBe(true);

    const args = adapter.beforeCreate.firstCall.args;
    expect(args.length).toEqual(3);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'beforeCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    adapter.beforeCreate.restore();
  });
  it('should allow returning a promise', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeCreate').callsFake((mapper, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeCreate');
      return Promise.resolve();
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    expect(adapter.beforeCreate.calledOnce).toBe(true);

    const args = adapter.beforeCreate.firstCall.args;
    expect(args.length).toEqual(3);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'beforeCreate should have received create props'
    );
    expect(args[2]).toBeDefined();
    adapter.beforeCreate.restore();
  });
  it('should allow returning a promise and re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    sinon.stub(adapter, 'beforeCreate').callsFake((mapper, props, opts) => {
      expect(opts).toBeDefined();
      expect(opts.op).toEqual('beforeCreate');
      return Promise.resolve({name: 'Sally'});
    });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual('Sally');
    expect(user[User.idAttribute]).toBeDefined();

    expect(adapter.beforeCreate.calledOnce).toBe(true);

    const args = adapter.beforeCreate.firstCall.args;
    expect(args.length).toEqual(3);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'beforeCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    adapter.beforeCreate.restore();
  });
});
