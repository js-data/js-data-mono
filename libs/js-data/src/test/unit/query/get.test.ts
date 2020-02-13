import { PostCollection } from '../../_setup';

describe('Query#get', () => {
  it('should not allow index access after operation', function () {
    const collection = PostCollection;

    expect(() => {
      collection
        .query()
        .filter()
        .get()
        .run();
    }).toThrow();
  });
});
