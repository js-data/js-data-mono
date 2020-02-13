import { JSData } from '../../_setup';

describe('Mapper#count', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.count).toEqual('function');
    expect(mapper.count).toBe(Mapper.prototype.count);
  });
  it('should count', async () => {
    const query = {id: 1};
    let countCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      count(mapper, _query, Opts) {
        countCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(false);
          resolve(1);
        });
      }
    });
    const count = await User.count(query);
    expect(countCalled).toBeTruthy();
    expect(count).toEqual(1);
  });
  it('should return raw', async () => {
    const query = {id: 1};
    let countCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      count(mapper, _query, Opts) {
        countCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toBeTruthy();
          resolve({
            data: 1
          });
        });
      }
    });
    const data = await User.count(query);
    expect(countCalled).toBeTruthy();
    expect(data.data).toEqual(1);
    expect(data.adapter).toEqual('mock');
  });
});
