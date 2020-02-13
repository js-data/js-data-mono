import { JSData } from '../../_setup';

describe('Record#set', () => {
  it('should set a property', () => {
    const user = new JSData.Record();
    expect(!user.foo).toBeTruthy();
    user.set('foo', 'bar');
    expect(user.foo).toEqual('bar');
  });
  it('should set a nested property', () => {
    const user = new JSData.Record();
    expect(!user.address).toBeTruthy();
    user.set('address.state', 'TX');
    expect(user.address.state).toEqual('TX');
  });
  it('should set multiple properties', () => {
    const user = new JSData.Record();
    expect(!user.foo).toBeTruthy();
    expect(!user.beep).toBeTruthy();
    user.set({
      foo: 'bar',
      beep: 'boop'
    });
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
  });
  it('should trigger change events', done => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          foo: {type: 'string', track: true},
          beep: {type: 'string', track: true}
        }
      }
    });
    let triggers = 0;
    const user = UserMapper.createRecord();
    user.on('change', () => {
      triggers++;
    });
    user.on('change:foo', () => {
      triggers++;
    });
    user.on('change:beep', () => {
      triggers++;
    });
    expect(!user.foo).toBeTruthy();
    expect(!user.beep).toBeTruthy();
    user.set({
      foo: 'bar',
      beep: 'boop'
    });
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    setTimeout(() => {
      expect(triggers).toEqual(3);
      done();
    }, 10);
  });
  it('should support "silent" option', done => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          foo: {type: 'string', track: true},
          beep: {type: 'string', track: true}
        }
      }
    });
    let triggers = 0;
    const user = UserMapper.createRecord();
    user.on('change', () => {
      triggers++;
    });
    user.on('change:foo', () => {
      triggers++;
    });
    user.on('change:beep', () => {
      triggers++;
    });
    expect(!user.foo).toBeTruthy();
    expect(!user.beep).toBeTruthy();
    user.set(
      {
        foo: 'bar'
      },
      {silent: true}
    );
    user.set('beep', 'boop', {silent: true});
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    setTimeout(() => {
      expect(triggers).toEqual(0);
      done();
    }, 10);
  });
});
