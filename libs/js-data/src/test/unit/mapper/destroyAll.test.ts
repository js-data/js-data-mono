import { JSData } from '../../_setup';

describe('Mapper#destroyAll', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.destroyAll).toEqual('function');
    expect(mapper.destroyAll).toBe(Mapper.prototype.destroyAll);
  });
  it('should destroyAll', async () => {
    const query = {};
    let destroyAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      destroyAll(mapper, _query, Opts) {
        destroyAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(false);
          resolve('foo');
        });
      }
    });
    const result = await User.destroyAll();
    expect(destroyAllCalled).toBeTruthy();
    expect(result).toEqual('foo');
  });
  it('should return raw', async () => {
    const query = {};
    let destroyAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      destroyAll(mapper, _query, Opts) {
        destroyAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(true);
          resolve({
            data: 'foo',
            deleted: 1
          });
        });
      }
    });
    const data = await User.destroyAll();
    expect(destroyAllCalled).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.deleted).toEqual(1);
    expect(data.data).toEqual('foo');
  });
});
