import { data, Post } from '../../_setup';

describe('Record#revert', () => {
  it('should return the previous version of an item', () => {
    const post = new Post.recordClass(data.p1);
    post.author = 'Jake';
    post.revert();
    expect(post).toEqual(data.p1);
  });
  it('should preserve fields in the optional preserve array', () => {
    const post = new Post.recordClass(data.p1);
    post.author = 'Jake';
    post.age = 20;
    post.revert({preserve: ['age']});
    expect(post.age).toEqual(20);
    expect(post.author).toEqual('John');
  });
  it('should revert key which has not been injected', () => {
    const post = new Post.recordClass(data.p1);
    expect(!post.newProperty).toBeTruthy();
    post.newProperty = 'new Property';
    post.revert();
    expect(!post.newProperty).toBeTruthy();
  });
});
