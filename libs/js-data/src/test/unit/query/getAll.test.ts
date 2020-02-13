import { PostCollection } from '../../_setup';

describe('Query#getAll', () => {
  it('should not allow index access after operation', function () {
    const collection = PostCollection;

    expect(() => {
      collection
        .query()
        .filter()
        .getAll()
        .run();
    }).toThrow();
  });
});
