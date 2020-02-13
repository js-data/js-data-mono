import { JSData } from '../../_setup';

describe('Mapper#updateAll', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.updateAll).toEqual('function');
    expect(mapper.updateAll).toBe(Mapper.prototype.updateAll);
  });
  it('should update', async () => {
    const id = 1;
    const query = {a: 'b'};
    const props = {name: 'John'};
    let updateAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      updateAll(mapper, _props, _query, Opts) {
        updateAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(false);
          _props.foo = 'bar';
          _props.id = id;
          resolve([_props]);
        });
      }
    });
    const users = await User.updateAll(props, query);
    expect(updateAllCalled).toBeTruthy();
    expect(users[0].foo).toEqual('bar');
    expect(users[0] instanceof User.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const id = 1;
    const query = {a: 'b'};
    const props = {name: 'John'};
    let updateAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      updateAll(mapper, _props, _query, Opts) {
        updateAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(true);
          _props.foo = 'bar';
          _props.id = id;
          resolve({
            data: [_props],
            updated: 1
          });
        });
      }
    });
    const data = await User.updateAll(props, query);
    expect(updateAllCalled).toBeTruthy();
    expect(data.data[0].foo).toEqual('bar');
    expect(data.data[0] instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.updated).toEqual(1);
  });
  it('should validate', async () => {
    const props = {name: 1234};
    let updateCalled = false;
    let users;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: {type: 'string', required: true},
          age: {type: 'number', required: true}
        }
      }
    });
    User.registerAdapter('mock', {
      updateAll() {
        updateCalled = true;
      }
    });
    try {
      users = await User.updateAll(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        {
          actual: 'number',
          expected: 'one of (string)',
          path: 'name'
        }
      ]);
    }
    expect(updateCalled).toEqual(false);
    expect(users).toEqual(undefined);
  });
});
