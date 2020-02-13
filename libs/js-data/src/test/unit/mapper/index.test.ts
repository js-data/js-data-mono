import { JSData, sinon } from '../../_setup';

describe('Mapper', () => {
  it('should be a constructor function', () => {
    const Mapper = JSData.Mapper;
    expect(typeof Mapper).toEqual('function');
    const mapper = new Mapper({name: 'foo'});
    expect(mapper instanceof Mapper).toEqual(true);
  });
  it('should require a name', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-expression
      new JSData.Mapper(); // eslint-disable-line
    }).toThrow();
  });
  it('should have events', () => {
    const User = new JSData.Mapper({name: 'user'});
    const listener = sinon.stub();
    User.on('bar', listener);
    User.emit('bar');
    expect(listener.calledOnce).toEqual(true);
  });
  it('should only work with known crud methods', () => {
    const User = new JSData.Mapper({name: 'user'});
    expect(() => {
      User.crud('foobar');
    }).toThrow();
  });
  it('should notify', done => {
    const stub = sinon.stub();
    const User = new JSData.Mapper({name: 'user', notify: true});
    User.on('beforeUpdate', stub);
    User.beforeUpdate(1, {name: 'John'}, {op: 'beforeUpdate'});
    setTimeout(() => {
      expect(stub.calledOnce).toEqual(true);
      done();
    }, 10);
  });
  it('should work without a record class', () => {
    const User = new JSData.Mapper({name: 'user', recordClass: false});
    expect(User.recordClass).toEqual(false);
  });
  it('should add methods to record class', () => {
    const User = new JSData.Mapper({
      name: 'user',
      methods: {
        foo() {
          return 'bar';
        }
      }
    });
    const user = User.createRecord();
    expect(user.foo()).toEqual('bar');
    const descriptor = Object.getOwnPropertyDescriptor(User.recordClass.prototype, 'foo');
    expect(descriptor.writable).toBeTruthy();
    expect(descriptor.configurable).toBeTruthy();
    expect(descriptor.enumerable).toEqual(false);
    expect(typeof descriptor.value).toEqual('function');
  });
});
