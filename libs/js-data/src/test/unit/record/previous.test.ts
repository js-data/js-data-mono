import { data, objectsEqual, objectsNotEqual, Post } from '../../_setup';

describe('Record#previous', () => {
  it('should hold previous data', () => {
    const post = new Post.recordClass(data.p1);
    objectsEqual(post, post.previous());
    post.foo = 'bar';
    objectsNotEqual(post, post.previous());
    delete post.foo;
    objectsEqual(post, post.previous());
  });
  it('should hold previous data for a specified key', () => {
    const post = new Post.recordClass(data.p1);
    expect('John').toEqual(post.previous('author'));
    post.author = 'Arnold';
    expect('John').toEqual(post.previous('author'));
    post.author = 'John';
    expect('John').toEqual(post.previous('author'));
  });
});
