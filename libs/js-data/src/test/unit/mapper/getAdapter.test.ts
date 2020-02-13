import { JSData } from '../../_setup';

describe('Mapper#getAdapter', () => {
  it('should get an adapter', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'user'});
    expect(typeof mapper.getAdapter).toEqual('function');
    expect(mapper.getAdapter).toBe(Mapper.prototype.getAdapter);

    const adapter = {};
    mapper.registerAdapter('foo', adapter);
    mapper.registerAdapter('bar', adapter, {default: true});
    expect(mapper.getAdapter('foo')).toBe(adapter);
    expect(mapper.getAdapter('bar')).toBe(adapter);
    expect(mapper.defaultAdapter).toEqual('bar');
    expect(() => {
      mapper.getAdapter();
    }).toThrow();
  });
});
