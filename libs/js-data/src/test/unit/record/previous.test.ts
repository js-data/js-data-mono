import { assert, data, JSData, objectsEqual, objectsNotEqual, Post } from '../../_setup';

describe('Record#previous', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record;
    const record = new Record();
    assert.equal(typeof record.previous, 'function');
    assert.strictEqual(record.previous, Record.prototype.previous);
  });
  it('should hold previous data', () => {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    objectsEqual(post, post.previous());
    post.foo = 'bar';
    objectsNotEqual(post, post.previous());
    delete post.foo;
    objectsEqual(post, post.previous());
  });
  it('should hold previous data for a specified key', () => {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    assert.equal('John', post.previous('author'));
    post.author = 'Arnold';
    assert.equal('John', post.previous('author'));
    post.author = 'John';
    assert.equal('John', post.previous('author'));
  });
});
