import { JSData } from '../../_setup';

describe('Record#unset', () => {
  it('should unset a property', () => {
    const user = new JSData.Record({foo: 'bar'});
    expect(user.foo).toEqual('bar');
    user.unset('foo');
    expect(!user.foo).toBeTruthy();
  });
  it('should set a nested property', () => {
    const user = new JSData.Record({address: {state: 'TX'}});
    expect(user.address.state).toEqual('TX');
    user.unset('address.state');
    expect(!user.address.state).toBeTruthy();
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
    const user = UserMapper.createRecord({foo: 'bar', beep: 'boop'});
    user.on('change', () => {
      triggers++;
    });
    user.on('change:foo', () => {
      triggers++;
    });
    user.on('change:beep', () => {
      triggers++;
    });
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    user.unset('foo');
    user.unset('beep');
    expect(!user.foo).toBeTruthy();
    expect(!user.beep).toBeTruthy();
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
    const user = UserMapper.createRecord({foo: 'bar', beep: 'boop'});
    user.on('change', () => {
      triggers++;
    });
    user.on('change:foo', () => {
      triggers++;
    });
    user.on('change:beep', () => {
      triggers++;
    });
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    user.unset('foo', {silent: true});
    user.unset('beep', {silent: true});
    expect(!user.foo).toBeTruthy();
    expect(!user.beep).toBeTruthy();
    setTimeout(() => {
      expect(triggers).toEqual(0);
      done();
    }, 10);
  });
});
