import { JSData } from '../../_setup';

describe('Mapper#updateMany', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.updateMany).toEqual('function');
    expect(mapper.updateMany).toBe(Mapper.prototype.updateMany);
  });
  it('should update', async () => {
    const id = 1;
    const props = [{id, name: 'John'}];
    let updateManyCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      updateMany(mapper, _props, Opts) {
        updateManyCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(Opts.raw).toEqual(false);
          _props[0].foo = 'bar';
          resolve(_props);
        });
      }
    });
    const users = await User.updateMany(props);
    expect(updateManyCalled).toBeTruthy();
    expect(users[0].foo).toEqual('bar');
    expect(users[0] instanceof User.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const id = 1;
    const props = [{id, name: 'John'}];
    let updateManyCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      updateMany(mapper, _props, Opts) {
        updateManyCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(Opts.raw).toEqual(true);
          _props[0].foo = 'bar';
          resolve({
            data: _props,
            updated: 1
          });
        });
      }
    });
    const data = await User.updateMany(props);
    expect(updateManyCalled).toBeTruthy();
    expect(data.data[0].foo).toEqual('bar');
    expect(data.data[0] instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.updated).toEqual(1);
  });
  it('should validate', async () => {
    const props = [
      {id: 1, name: 1234},
      {id: 2, name: 'John'},
      {id: 3, age: false}
    ];
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
      updateMany() {
        updateCalled = true;
      }
    });
    try {
      users = await User.updateMany(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        [
          {
            actual: 'number',
            expected: 'one of (string)',
            path: 'name'
          }
        ],
        undefined,
        [
          {
            actual: 'boolean',
            expected: 'one of (number)',
            path: 'age'
          }
        ]
      ]);
    }
    expect(updateCalled).toEqual(false);
    expect(users).toEqual(undefined);
  });
});
