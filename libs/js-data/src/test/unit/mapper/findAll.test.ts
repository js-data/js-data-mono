import { JSData } from '../../_setup';

describe('Mapper#findAll', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.findAll).toEqual('function');
    expect(mapper.findAll).toBe(Mapper.prototype.findAll);
  });
  it('should findAll', async () => {
    const query = {id: 1};
    const id = 1;
    const props = [{id, name: 'John'}];
    let findAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      findAll(mapper, _query, Opts) {
        findAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(false);
          resolve(props);
        });
      }
    });
    const users = await User.findAll(query);
    expect(findAllCalled).toBeTruthy();
    expect(users).toEqual(props);
    expect(users[0] instanceof User.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const query = {id: 1};
    const id = 1;
    const props = [{id, name: 'John'}];
    let findAllCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      findAll(mapper, _query, Opts) {
        findAllCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_query).toEqual(query);
          expect(Opts.raw).toEqual(true);
          resolve({
            data: props,
            found: 1
          });
        });
      }
    });
    const data = await User.findAll(query);
    expect(findAllCalled).toBeTruthy();
    expect(data.data).toEqual(props);
    expect(data.data[0] instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.found).toEqual(1);
  });
});
