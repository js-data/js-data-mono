import { JSData } from '../../_setup';

describe('Mapper#sum', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.sum).toEqual('function');
    expect(mapper.sum).toBe(Mapper.prototype.sum);
  });
  it('should sum', async () => {
    const query = {id: 1};
    let sumCalled = false;
    const User = new JSData.Mapper({
      // eslint-disable-line
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      sum(mapper, _field, _query, Opts) {
        sumCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_field).toEqual('age');
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(false);
          resolve(30);
        });
      }
    });
    const sum = await User.sum('age', query);
    expect(sumCalled).toBeTruthy();
    expect(sum).toEqual(30);
  });
  it('should return raw', async () => {
    const query = {id: 1};
    let sumCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      sum(mapper, _field, _query, Opts) {
        sumCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_field).toEqual('age');
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(true);
          resolve({
            data: 30
          });
        });
      }
    });
    const data = await User.sum('age', query);
    expect(sumCalled).toBeTruthy();
    expect(data.data).toEqual(30);
    expect(data.adapter).toEqual('mock');
  });
});
