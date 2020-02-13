import { JSData } from '../../_setup';

describe('Record#destroy', () => {
  it('can destroy itself', async () => {
    const store = new JSData.DataStore();
    const mockAdapter = {
      destroy(mapper, id, opts) {
        expect(id).toEqual(1);
        return Promise.resolve();
      }
    };
    store.registerAdapter('mock', mockAdapter, {default: true});
    const FooMapper = store.defineMapper('foo'); // eslint-disable-line
    const foo = store.add('foo', {id: 1});
    let result = await foo.destroy();
    expect(!store.get('foo', 1)).toBeTruthy();
    expect(foo).toBe(result);

    const BarMapper = new JSData.Mapper({name: 'bar'});
    BarMapper.registerAdapter('mock', mockAdapter, {default: true});
    const bar = BarMapper.createRecord({id: 1});
    result = await bar.destroy();
    expect(result).toEqual(undefined);
  });
});
