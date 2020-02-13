import { JSData } from '../../_setup';

describe('Mapper#find', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.find).toEqual('function');
    expect(mapper.find).toBe(Mapper.prototype.find);
  });
  it('should find', async () => {
    const id = 1;
    const props = {id, name: 'John'};
    let findCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      find(mapper, _id, Opts) {
        findCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(Opts.raw).toEqual(false);
          resolve(props);
        });
      }
    });
    const user = await User.find(id);
    expect(findCalled).toBeTruthy();
    expect(user).toEqual(props);
    expect(user instanceof User.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const id = 1;
    const props = {id, name: 'John'};
    let findCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      find(mapper, _id, Opts) {
        findCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_id).toEqual(id);
          expect(Opts.raw).toEqual(true);
          resolve({
            data: props,
            found: 1
          });
        });
      }
    });
    const data = await User.find(id);
    expect(findCalled).toBeTruthy();
    expect(data.data).toEqual(props);
    expect(data.data instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.found).toEqual(1);
  });
});
