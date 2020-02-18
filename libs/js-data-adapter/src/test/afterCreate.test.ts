import { $$adapter, $$User, debug, objectsEqual } from './index';
import * as sinon from 'sinon';

describe('Adapter#afterCreate', () => {
  it('should call afterCreate', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    const afterCreateStud = sinon
      .stub(adapter, 'afterCreate')
      .callsFake(async (mapper, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterCreate');
      });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    expect(afterCreateStud.calledOnce).toBe(true);

    const args = afterCreateStud.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'afterCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    expect(typeof args[3]).toBe('object');
    afterCreateStud.restore();
  });
  it('should allow re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    const afterCreateStud = sinon
      .stub(adapter, 'afterCreate')
      .callsFake(async (mapper, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterCreate');
        return 'foo';
      });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user).toEqual('foo');

    expect(afterCreateStud.calledOnce).toBe(true);

    const args = afterCreateStud.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'afterCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    expect(typeof args[3]).toBe('object');
    afterCreateStud.restore();
  });
  it('should allow returning a promise', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    const afterCreateStud = sinon
      .stub(adapter, 'afterCreate')
      .callsFake((mapper, props, opts, record) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterCreate');
        return Promise.resolve();
      });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    expect(afterCreateStud.calledOnce).toBe(true);

    const args = afterCreateStud.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'afterCreate should have received create props'
    );
    expect(args[2]).toBeDefined();
    expect(typeof args[3]).toBe('object');
    afterCreateStud.restore();
  });
  it('should allow returning a promise and re-assignment', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    const afterCreateStud = sinon
      .stub(adapter, 'afterCreate')
      .callsFake(async (mapper, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterCreate');
        return 'foo';
      });

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user).toEqual('foo');

    expect(afterCreateStud.calledOnce).toBe(true);

    const args = afterCreateStud.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'afterCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    expect(typeof args[3]).toBe('object');
    afterCreateStud.restore();
  });
  it('should receive raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    const afterCreateStud = sinon
      .stub(adapter, 'afterCreate')
      .callsFake(async (mapper, props, opts) => {
        expect(opts).toBeDefined();
        expect(opts.op).toEqual('afterCreate');
      });

    debug('create', User.name, props);
    const result = await adapter.create(User, props, {raw: true});
    debug('created', User.name, result);

    expect(result.created).toEqual(1);
    expect(result.data.name).toEqual(props.name);
    expect(result.data[User.idAttribute]).toBeDefined();

    expect(afterCreateStud.calledOnce).toBe(true);

    const args = afterCreateStud.firstCall.args;
    expect(args.length).toEqual(4);
    expect(args[0] === User).toBe(true);
    objectsEqual(
      args[1],
      {name: 'John'},
      'afterCreate should have received create props'
    );
    expect(typeof args[2]).toBe('object');
    expect(typeof args[3]).toBe('object');
    expect(args[3].created).toEqual(1);
    expect(typeof args[3].data).toBe('object');
    afterCreateStud.restore();
  });
});
