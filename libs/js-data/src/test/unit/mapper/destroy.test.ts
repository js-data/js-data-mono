import { JSData } from '../../_setup';

describe('Mapper#createRecord', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.destroy).toEqual('function');
    expect(mapper.destroy).toBe(Mapper.prototype.destroy);
  });
  it('should destroy', async () => {
    const id = 1;
    let destroyCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      destroy(mapper, _id, Opts) {
        destroyCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(Opts.raw).toEqual(false);
          resolve('foo');
        });
      }
    });
    const result = await User.destroy(id);
    expect(destroyCalled).toBeTruthy();
    expect(result).toEqual('foo');
  });
  it('should return raw', async () => {
    const id = 1;
    let destroyCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      destroy(mapper, _id, Opts) {
        destroyCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(Opts.raw).toEqual(true);
          resolve({
            deleted: 1,
            data: 'foo'
          });
        });
      }
    });
    const data = await User.destroy(id);
    expect(destroyCalled).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.deleted).toEqual(1);
    expect(data.data).toEqual('foo');
  });
});
