import { data, store } from '../../_setup';

describe('Query#limit', () => {
  it('should correctly apply "limit" predicates', function () {
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    store.add('post', [p1, p2, p3, p4]);
    const params = {
      limit: 1
    };

    expect(store.query('post').filter(params).run()).toEqual([p1]);
    expect(store.query('post').limit(params.limit).run()).toEqual([p1]);

    params.limit = 2;
    expect(store.query('post').filter(params).run()).toEqual([p1, p2]);
    expect(store.query('post').limit(params.limit).run()).toEqual([p1, p2]);

    params.limit = 3;
    expect(store.query('post').filter(params).run()).toEqual([p1, p2, p3]);
    expect(store.query('post').limit(params.limit).run()).toEqual([p1, p2, p3]);

    params.limit = 4;
    expect(store.query('post').filter(params).run()).toEqual([p1, p2, p3, p4]);
    expect(store.query('post').limit(params.limit).run()).toEqual([p1, p2, p3, p4]);
  });
  it('should correctly apply "limit" and "skip" predicates together', function () {
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    store.add('post', [p1, p2, p3, p4]);
    const params = {
      limit: 1,
      skip: 1
    };

    expect(store.query('post').filter(params).run()).toEqual([p2]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([p2]);

    params.limit = 2;
    expect(store.query('post').filter(params).run()).toEqual([p2, p3]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([p2, p3]);

    params.skip = 2;
    expect(store.query('post').filter(params).run()).toEqual([p3, p4]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([p3, p4]);

    params.limit = 1;
    params.skip = 3;
    expect(store.query('post').filter(params).run()).toEqual([p4]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([p4]);

    params.limit = 8;
    params.skip = 0;
    expect(store.query('post').filter(params).run()).toEqual([p1, p2, p3, p4]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([p1, p2, p3, p4]);

    params.limit = 1;
    params.skip = 5;
    expect(store.query('post').filter(params).run()).toEqual([]);
    expect(store.query('post').skip(params.skip).limit(params.limit).run()).toEqual([]);

    params.limit = 8;
    delete params.skip;
    expect(store.query('post').filter(params).run()).toEqual([p1, p2, p3, p4]);
    expect(() => {
      store
        .query('post')
        .skip(params.skip)
        .limit(params.limit)
        .run();
    }).toThrow();

    delete params.limit;
    params.skip = 5;
    expect(store.query('post').filter(params).run()).toEqual([]);
    expect(() => store.query('post').skip(params.skip).limit(params.limit).run()).toThrow();
  });
});
