import { JSData, sinon } from '../../_setup';
import { proxiedMapperMethods } from '../../../lib/Container';

describe('Container', () => {
  it('should be a constructor function', () => {
    const Container = JSData.Container;
    expect(typeof Container).toEqual('function');
    const container = new Container();
    expect(container instanceof Container).toBeTruthy();
    expect(container._adapters).toEqual({});
    expect(container._mappers).toEqual({});
    expect(container.mapperDefaults).toEqual({});
    expect(container.mapperClass).toBe(JSData.Mapper);
  });
  it('should accept overrides', () => {
    const Container = JSData.Container;

    class Foo {}

    const container = new Container({
      mapperClass: Foo,
      foo: 'bar',
      mapperDefaults: {
        idAttribute: '_id'
      }
    });
    expect(container._adapters).toEqual({});
    expect(container._mappers).toEqual({});
    expect(container.foo).toEqual('bar');
    expect(container.mapperDefaults).toEqual({
      idAttribute: '_id'
    });
    expect(container.mapperClass).toBe(Foo);
  });
  it('should have events', () => {
    const store = new JSData.Container();
    const listener = sinon.stub();
    store.on('bar', listener);
    store.emit('bar');
    expect(listener.calledOnce).toBeTruthy();
  });
  it('should proxy Mapper events', () => {
    const store = new JSData.Container();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('bar', listener);
    store.getMapper('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['user', 'foo']);
  });
  it('should proxy all Mapper events', () => {
    const store = new JSData.Container();
    store.defineMapper('user');
    const listener = sinon.stub();
    store.on('all', listener);
    store.getMapper('user').emit('bar', 'foo');
    expect(listener.calledOnce).toBeTruthy();
    expect(listener.firstCall.args).toEqual(['bar', 'user', 'foo']);
  });
  it('should proxy Mapper methods', () => {
    const container = new JSData.Container();
    const mapper = container.defineMapper('user');
    proxiedMapperMethods.forEach(method => {
      const errorMsg = `${method} called with wrong arguments`;
      sinon.replace(mapper, method, sinon.fake());
      if (method === 'getSchema') {
        container[method]('user');
        expect((mapper[method] as any).calledWithMatch()).toBeTruthy();
      } else {
        container[method]('user', {id: 1});
        expect(mapper[method].calledWithMatch({id: 1})).toBeTruthy();
      }
    });
  });
});
