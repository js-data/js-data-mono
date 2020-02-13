import { JSData } from '../../_setup';

describe('Mapper#update', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.update).toEqual('function');
    expect(mapper.update).toBe(Mapper.prototype.update);
  });
  it('should update', async () => {
    const id = 1;
    const props = {name: 'John'};
    let updateCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      update(mapper, _id, _props, Opts) {
        updateCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(_props).toEqual(props);
          expect(Opts.raw).toEqual(false);
          _props.foo = 'bar';
          _props.id = id;
          resolve(_props);
        });
      }
    });
    const user = await User.update(id, props);
    expect(updateCalled).toBeTruthy();
    expect(user.foo).toEqual('bar');
    expect(user instanceof User.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const id = 1;
    const props = {name: 'John'};
    let updateCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      update(mapper, _id, _props, Opts) {
        updateCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(_props).toEqual(props);
          expect(Opts.raw).toEqual(true);
          _props.foo = 'bar';
          _props.id = id;
          resolve({
            data: _props,
            updated: 1
          });
        });
      }
    });
    const data = await User.update(id, props);
    expect(updateCalled).toBeTruthy();
    expect(data.data.foo).toEqual('bar');
    expect(data.data instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.updated).toEqual(1);
  });
  it('should validate', async () => {
    const props = {name: 1234};
    let updateCalled = false;
    let user;
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
      update() {
        updateCalled = true;
      }
    });
    try {
      user = await User.update(1, props);
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
    expect(user).toEqual(undefined);
  });
  it('should update nested', async () => {
    const props = {
      id: 1,
      addresses: [
        {
          id: 45,
          customer_id: 1
        }
      ]
    };
    let updateCalled = false;
    const store = new JSData.Container({
      mapperDefaults: {
        defaultAdapter: 'mock'
      }
    });
    store.registerAdapter('mock', {
      update(mapper, id, props) {
        expect(props.id).toEqual(1);
        expect(props.addresses.length).toEqual(1);
        expect(props.addresses[0].id).toEqual(45);
        expect(props.addresses[0].customer_id).toEqual(1);
        updateCalled = true;
        return props;
      }
    });
    store.defineMapper('customer', {
      relations: {
        hasMany: {
          address: {
            localField: 'addresses',
            foreignKey: 'customer_id'
          }
        }
      }
    });
    store.defineMapper('address', {
      relations: {
        belongsTo: {
          customer: {
            localField: 'customer',
            foreignKey: 'customer_id'
          }
        }
      }
    });
    await store.update('customer', 1, props, {with: ['address']});
    expect(updateCalled).toEqual(true);
  });
});
