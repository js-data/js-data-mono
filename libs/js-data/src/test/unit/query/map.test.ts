import { data, PostCollection, store } from '../../_setup';

describe('Query#map', () => {
  it('should work', function () {
    const collection = PostCollection;
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    const p5 = data.p5;

    store.add('post', [p1, p2, p3, p4, p5]);
    const ids = collection
      .query()
      .map(post => post.id)
      .run();
    expect(ids).toEqual([5, 6, 7, 8, 9]);
  });
});
