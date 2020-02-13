import { assert, data, JSData, objectsEqual, Post } from '../../_setup';

describe('Record#revert', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record;
    const record = new Record();
    assert.equal(typeof record.revert, 'function');
    assert.strictEqual(record.revert, Record.prototype.revert);
  });
  it('should return the previous version of an item', () => {
    const post = new Post.recordClass(data.p1);
    post.author = 'Jake';
    post.revert();
    objectsEqual(post, data.p1);
  });
  it('should preserve fields in the optional preserve array', () => {
    const post = new Post.recordClass(data.p1);
    post.author = 'Jake';
    post.age = 20;
    post.revert({preserve: ['age']});
    assert.equal(post.age, 20, 'The age of the post should have been preserved');
    assert.equal(post.author, 'John', 'The author of the post should have been reverted');
  });
  it('should revert key which has not been injected', () => {
    const post = new Post.recordClass(data.p1);
    assert(!post.newProperty);
    post.newProperty = 'new Property';
    post.revert();
    assert(!post.newProperty);
  });
});
