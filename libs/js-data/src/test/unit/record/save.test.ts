import { JSData } from '../../_setup';

describe('Record#save', () => {
  it('can create itself', async () => {
    let id = 1;
    const store = new JSData.DataStore();
    const mockAdapter = {
      create(mapper, props, opts) {
        props.id = id;
        id++;
        return Promise.resolve(JSON.parse(JSON.stringify(props)));
      }
    };
    store.registerAdapter('mock', mockAdapter, {default: true});
    const FooMapper = store.defineMapper('foo');
    const foo = store.createRecord('foo', {foo: 'bar'});
    const createdFoo = await foo.save();
    expect(createdFoo).toEqual({id: 1, foo: 'bar'});
    expect(createdFoo instanceof FooMapper.recordClass).toBeTruthy();
    expect(foo).toBe(createdFoo);
    expect(store.get('foo', 1)).toBe(createdFoo);

    const BarMapper = new JSData.Mapper({name: 'bar'});
    BarMapper.registerAdapter('mock', mockAdapter, {default: true});
    const bar = BarMapper.createRecord({bar: 'foo'});
    const createdBar = await bar.save();
    expect(createdBar).toEqual({id: 2, bar: 'foo'});
    expect(createdBar instanceof BarMapper.recordClass).toBeTruthy();
  });

  it('can update itself', async () => {
    const store = new JSData.DataStore();
    const mockAdapter = {
      update(mapper, id, props, opts) {
        props.beep = 'boop';
        return Promise.resolve(JSON.parse(JSON.stringify(props)));
      }
    };
    store.registerAdapter('mock', mockAdapter, {default: true});
    const FooMapper = store.defineMapper('foo');
    const foo = store.add('foo', {id: 1, foo: 'bar'});
    const updateFoo = await foo.save();
    expect(foo).toEqual({id: 1, foo: 'bar', beep: 'boop'});
    expect(updateFoo).toEqual({id: 1, foo: 'bar', beep: 'boop'});
    expect(updateFoo instanceof FooMapper.recordClass).toBeTruthy();
    expect(store.get('foo', 1)).toBe(updateFoo);
    expect(foo).toBe(updateFoo);

    const BarMapper = new JSData.Mapper({name: 'bar'});
    BarMapper.registerAdapter('mock', mockAdapter, {default: true});
    const bar = BarMapper.createRecord({id: 1, bar: 'foo'});
    const updatedBar = await bar.save();
    expect(updatedBar).toEqual({id: 1, bar: 'foo', beep: 'boop'});
    expect(updatedBar instanceof BarMapper.recordClass).toBeTruthy();
  });

  it('can update itself with changes only', async () => {
    const mockAdapter = {
      update(mapper, id, props, opts) {
        expect(props).toEqual({bar: 'bar', bing: 'bang', beep: null});
        props.id = 1;
        return Promise.resolve(JSON.parse(JSON.stringify(props)));
      }
    };
    const BarMapper = new JSData.Mapper({
      name: 'bar'
    });
    BarMapper.registerAdapter('mock', mockAdapter, {default: true});
    const bar = BarMapper.createRecord({id: 1, bar: 'foo', beep: 'boop'});
    bar.bing = 'bang';
    bar.bar = 'bar';
    bar.beep = null;
    const updatedBar = await bar.save({changesOnly: true});
    expect(updatedBar).toEqual({id: 1, bar: 'bar', bing: 'bang', beep: null});
    expect(updatedBar instanceof BarMapper.recordClass).toBeTruthy();
  });
});
