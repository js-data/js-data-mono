import { data, store } from '../../_setup';

describe('Query#skip', () => {
  it('should correctly apply "skip" predicates', function () {
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    store.add('post', [p1, p2, p3, p4]);
    const params = {skip: 1};

    expect(store.query('post').filter(params).run()).toEqual([p2, p3, p4]);
    expect(store.query('post').skip(params.skip).run()).toEqual([p2, p3, p4]);

    params.skip = 2;
    expect(store.query('post').filter(params).run()).toEqual([p3, p4]);
    expect(store.query('post').skip(params.skip).run()).toEqual([p3, p4]);

    params.skip = 3;
    expect(store.query('post').filter(params).run()).toEqual([p4]);
    expect(store.query('post').skip(params.skip).run()).toEqual([p4]);

    params.skip = 4;
    expect(store.query('post').filter(params).run()).toEqual([]);
    expect(store.query('post').skip(params.skip).run()).toEqual([]);
  });
});
