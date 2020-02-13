import { data, JSData, Post } from '../../_setup';

describe('Record#changes', () => {
  it('should be empty right after an instance is created', function () {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
  });
  it('should detect tracked field changes', function () {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
    post.author = 'Jake';
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    });
  });
  it('should detect untracked field changes', function () {
    const post = new Post.recordClass(data.p1); // eslint-disable-line
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
    post.foo = 'bar';
    expect(post.changes()).toEqual({
      added: {
        foo: 'bar'
      },
      removed: {},
      changed: {}
    });
  });
  it('should show changed tracked fields', function () {
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
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
    post.author = 'Jake';
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    });
    post.author = 'John';
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
  });
  it('should show changed tracked fields (tracking all fields)', function () {
    const PostMapper = new JSData.Mapper({
      name: 'post',
      schema: {
        track: true,
        properties: {
          author: {
            type: 'string'
          }
        }
      }
    });
    const post = PostMapper.createRecord(data.p1);
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
    post.author = 'Jake';
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    });
    post.author = 'John';
    expect(post.changes()).toEqual({
      added: {},
      removed: {},
      changed: {}
    });
  });
});
