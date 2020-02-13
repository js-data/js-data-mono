import { JSData } from '../../_setup';

describe('Container#defineMapper', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container;
    const store = new Container();
    expect(typeof store.defineMapper).toEqual('function');
    expect(store.defineMapper).toBe(Container.prototype.defineMapper);
  });
  it('should create a new mapper', () => {
    const Container = JSData.Container;
    let container = new Container();
    let mapper = container.defineMapper('foo');
    expect(mapper).toBe(container._mappers.foo);
    expect(mapper instanceof JSData.Mapper).toBeTruthy();
    expect(mapper.getAdapters()).toBe(container.getAdapters());

    class Foo extends JSData.Mapper {
      constructor(opts) {
        super(opts);
        if (!this.lifecycleMethods) {
          JSData.Mapper.call(this, opts);
        }
      }
    }

    container = new Container({
      mapperClass: Foo
    });
    mapper = container.defineMapper('foo');
    expect(mapper).toBe(container._mappers.foo);
    expect(mapper instanceof Foo).toBeTruthy();
    expect(mapper.getAdapters()).toBe(container.getAdapters());

    container = new Container({
      mapperDefaults: {
        foo: 'bar'
      }
    });
    mapper = container.defineMapper('foo');
    expect(mapper).toBe(container._mappers.foo);
    expect(mapper instanceof JSData.Mapper).toBeTruthy();
    expect(mapper.foo).toEqual('bar');
    expect(mapper.getAdapters()).toBe(container.getAdapters());

    container = new Container({
      mapperDefaults: {
        foo: 'bar'
      }
    });
    mapper = container.defineMapper('foo', {
      foo: 'beep'
    });
    expect(mapper).toBe(container._mappers.foo);
    expect(mapper instanceof JSData.Mapper).toBeTruthy();
    expect(mapper.foo).toEqual('beep');
    expect(mapper.getAdapters()).toBe(container.getAdapters());

    expect(() => {
      mapper = container.defineMapper();
    }).toThrow();

    expect(() => {
      mapper = container.defineMapper({
        foo: 'bar'
      });
    }).toThrow();

    mapper = container.defineMapper({
      foo: 'bar',
      name: 'foo'
    });
    expect(mapper.name).toEqual('foo');
  });
  it('can get a scoped reference', () => {
    const Container = JSData.Container;
    const container = new Container();
    const fooMapper = container.defineMapper('foo');
    const fooStore = container.as('foo');

    expect(fooStore._adapters).toBe(container._adapters);
    expect(fooStore._listeners).toBe(container._listeners);
    expect(fooStore.getMapper()).toBe(container.getMapper('foo'));
    expect(fooStore.createRecord({foo: 'bar'})).toEqual(container.createRecord('foo', {foo: 'bar'}));
    expect(fooMapper).toBe(container.getMapper('foo'));
    expect(fooStore.getMapper()).toBe(container.getMapper('foo'));
  });
});
