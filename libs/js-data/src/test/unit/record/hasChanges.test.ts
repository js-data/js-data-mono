import { data, JSData, Post, sinon } from '../../_setup';

describe('Record#hasChanges', () => {
  it('should detect when untracked fields are changed', function () {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    expect(!post.hasChanges()).toBeTruthy();
    post.author = 'Jake';
    expect(post.hasChanges()).toBeTruthy();
  });
  it('should return true if a tracked field is changed', function (done) {
    const PostMapper = new JSData.Mapper({
      name: 'post',
      schema: {
        properties: {
          author: {
            type: 'string',
            track: true
          }
        }
      }
    });
    const post = PostMapper.createRecord(data.p1);
    const listener = sinon.stub();
    post.on('change', listener);
    expect(!post.hasChanges()).toBeTruthy();
    post.author = 'Jake';
    expect(post.hasChanges()).toBeTruthy();
    post.author = 'John';
    expect(!post.hasChanges()).toBeTruthy();
    setTimeout(() => {
      expect(listener.callCount).toEqual(0);
      done();
    }, 5);
  });

  /* The previous test has a property set and changed back within a single event loop
   * So no listener is ever called.
   * This test checks that hasChanges() is still false (if the state is set back to the previous)
   * even if both changes were registered and a listener was called on each change (twice in total).
   */

  it('is not affected by timing', function (done) {
    const PostMapper = new JSData.Mapper({
      name: 'post',
      schema: {
        properties: {
          author: {
            type: 'string',
            track: true
          }
        }
      }
    });
    const post = PostMapper.createRecord(data.p1);
    const listener = sinon.stub();
    post.on('change', listener);
    post.author = 'Jake';
    expect(post.hasChanges()).toBeTruthy();
    const secondSpec = () => {
      expect(listener.callCount).toEqual(2);
      expect(!post.hasChanges()).toBeTruthy();
      done();
    };
    setTimeout(() => {
      expect(listener.callCount).toEqual(1);
      post.author = 'John';
      setTimeout(secondSpec, 5);
    }, 5);
  });
});
