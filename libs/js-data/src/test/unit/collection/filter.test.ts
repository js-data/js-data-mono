import { data, JSData, PostCollection, store } from '../../_setup';

describe('Collection#filter', () => {
  // Most filter tests are on the Query class
  it('should work', function () {
    const collection = PostCollection;
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    const p5 = data.p5;
    store.add('post', [p1, p2, p3, p4, p5]);

    const params = {
      author: 'John'
    };

    expect(collection.filter(params)).toEqual([p1]);
  });
  it.skip('should allow use of scopes', () => {
    const store = new JSData.DataStore({
      scopes: {
        defaultScope: {
          foo: 'bar'
        }
      }
    });
    store.defineMapper('foo', {
      scopes: {
        second: {
          beep: 'boop'
        },
        limit: {
          limit: 1
        }
      }
    });
    const foos = store.add('foo', [
      {id: 1, foo: 'bar'},
      {id: 2, beep: 'boop'},
      {id: 3, foo: 'bar', beep: 'boop'},
      {id: 4, foo: 'bar', beep: 'boop'},
      {id: 5, foo: 'bar', beep: 'boop'},
      {id: 6, foo: 'bar', beep: 'boop'},
      {id: 7, foo: 'bar', beep: 'boop'},
      {id: 8, foo: 'bar', beep: 'boop'}
    ]);
    expect(store.filter('foo', null, {
      scope: ['second', 'limit']
    })).toEqual([foos[2]]);
    expect(store.filter('foo', null, {
      scope: ['second']
    })).toEqual(store.filter('foo', {
      foo: 'bar',
      beep: 'boop'
    }));
    expect(store.filter('foo')).toEqual(store.filter('foo', {
      foo: 'bar'
    }));
  });
});
