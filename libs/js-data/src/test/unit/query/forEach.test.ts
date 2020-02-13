import { data, PostCollection, store } from '../../_setup';

describe('Query#forEach', () => {
  it('should work', function () {
    const collection = PostCollection;
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    const p5 = data.p5;

    store.add('post', [p1, p2, p3, p4, p5]);
    let count = 0;
    collection
      .query()
      .forEach(() => {
        count++;
      })
      .run();
    expect(count).toEqual(5);
  });
});
