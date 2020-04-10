import {
  $$adapter,
  $$Comment,
  $$Post,
  $$Profile,
  $$Tag,
  $$User,
  debug,
  equalObjects,
  objectsEqual,
  options,
  toClear
} from './_setup';

describe('LocalStorageAdapter#find', () => {
  let adapter, User, Profile, Post, Comment, Tag;

  beforeEach(() => {
    adapter = $$adapter;
    User = $$User;
    Profile = $$Profile;
    Post = $$Post;
    Comment = $$Comment;
    Tag = $$Tag;
  });

  it('should find a user', async () => {
    toClear.push('Post');
    toClear.push('Comment');
    let props: any = {name: 'John'};
    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);
    const userId = user[User.idAttribute];
    expect(user.name).toEqual('John');
    expect(user[User.idAttribute]).toBeDefined();

    // Test beforeFind and afterFind
    let beforeFindCalled = false;
    let afterFindCalled = false;
    adapter.beforeFind = (mapper, id, opts) => {
      beforeFindCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(id).toEqual(userId);
      expect(typeof opts).toBe('object');
      // Optionally return a promise for async
      return Promise.resolve();
    };
    adapter.afterFind = (mapper, id, opts, record) => {
      afterFindCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(id).toEqual(userId);
      expect(typeof opts).toBe('object');
      expect(typeof record).toBe('object');
      // Optionally return a promise for async
      return Promise.resolve();
    };

    debug('find', User.name, userId);
    let foundUser = await adapter.find(User, userId);
    debug('found', User.name, foundUser);
    expect(foundUser.name).toEqual('John');
    expect(foundUser[User.idAttribute]).toEqual(userId);
    expect(beforeFindCalled).toBe(true);
    expect(afterFindCalled).toBe(true);

    // should allow re-assignment
    beforeFindCalled = false;
    afterFindCalled = false;
    adapter.afterFind = (mapper, id, opts, record) => {
      afterFindCalled = true;
      expect(typeof mapper).toBe('object');
      expect(id).toBeDefined();
      expect(id).toEqual(userId);
      expect(typeof opts).toBe('object');
      expect(typeof record).toBe('object');
      // Test re-assignment
      return Promise.resolve({name: 'Sally', [User.idAttribute]: userId});
    };

    debug('find', User.name, userId);
    foundUser = await adapter.find(User, userId);
    debug('found', User.name, foundUser);
    expect(foundUser.name).toEqual('Sally');
    expect(foundUser[User.idAttribute]).toEqual(userId);
    expect(beforeFindCalled).toBe(true);
    expect(afterFindCalled).toBe(true);
    // clear hooks
    delete adapter.beforeFind;
    delete adapter.afterFind;

    props = {content: 'test', userId: userId};
    debug('create', Post.name, props);
    const post = await adapter.create(Post, props);
    debug('created', Post.name, post);
    const postId = post[Post.idAttribute];

    expect(post.content).toEqual('test');
    expect(post[Post.idAttribute]).toBeDefined();
    expect(post.userId).toEqual(userId);

    props = [
      {
        content: 'test2',
        postId,
        userId
      },
      {
        content: 'test3',
        postId,
        userId
      }
    ];
    debug('create', Comment.name, props);
    const comments = await Promise.all([
      adapter.create(Comment, props[0]),
      adapter.create(Comment, props[1])
    ]);
    debug('created', Comment.name, comments);

    comments.sort((a, b) => a.content - b.content);

    debug('find', Post.name, postId);
    const foundPost = await adapter.find(Post, postId, {
      with: ['user', 'comment']
    });
    debug('found', Post.name, foundPost);
    foundPost.comments.sort((a, b) => {
      return a.content > b.content;
    });
    equalObjects(foundPost.user, user, 'foundPost.user');
    equalObjects(foundPost.comments, comments, 'foundPost.comments');
  });

  it('should return raw', async () => {
    const props = {name: 'John'};
    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);
    const userId = user[User.idAttribute];
    expect(user.name).toEqual('John');
    expect(user[User.idAttribute]).toBeDefined();

    debug('find', User.name, userId);
    const result = await adapter.find(User, userId, {raw: true});
    debug('found', User.name, result);
    expect(result.data).toBeDefined();
    expect(result.found).toBeDefined();
    expect(result.data.name).toEqual('John');
    expect(result.data[User.idAttribute]).toEqual(userId);
    expect(result.found).toEqual(1);
  });

  it('should return nothing', async () => {
    debug('find', User.name, 'non-existent-id');
    const result = await adapter.find(User, 'non-existent-id');
    debug('found', User.name, result);
    expect(result).not.toBeDefined();
  });

  it('should return raw and nothing', async () => {
    debug('find', User.name, 'non-existent-id');
    const result = await adapter.find(User, 'non-existent-id', {raw: true});
    debug('found', User.name, result);
    expect(result.data).not.toBeDefined();
    expect(result.found).toBeDefined();
    expect(result.found).toEqual(0);
  });

  it('should load belongsTo relations', async () => {
    toClear.push('Post');
    toClear.push('Comment');
    toClear.push('Profile');
    let props: any = {name: 'John'};
    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    props = {email: 'foo@test.com', userId: user[User.idAttribute]};
    debug('create', Profile.name, props);
    const profile = await adapter.create(Profile, props);
    debug('created', Profile.name, profile);

    props = {content: 'foo', userId: user[User.idAttribute]};
    debug('create', Post.name, props);
    const post = await adapter.create(Post, props);
    debug('created', Post.name, post);

    props = {
      content: 'test2',
      postId: post[Post.idAttribute],
      userId: post.userId
    };
    debug('create', Comment.name, props);
    let comment = await adapter.create(Comment, props);
    debug('created', Comment.name, comment);

    debug('find', Comment.name, comment[Comment.idAttribute]);
    comment = await adapter.find(Comment, comment[Comment.idAttribute], {
      with: ['user', 'post']
    });
    debug('found', Comment.name, comment);

    expect(comment).toBeDefined();
    expect(comment.post).toBeDefined();
    expect(comment.user).toBeDefined();
  });

  it('should load belongsTo relations and filter sub queries', async () => {
    toClear.push('Post');
    toClear.push('Comment');
    let props: any = {name: 'John'};
    debug('create', User.name, props);
    let user = await adapter.create(User, props);
    debug('created', User.name, user);

    props = {name: 'Sally'};
    debug('create', User.name, props);
    const user2 = await adapter.create(User, props);
    debug('created', User.name, user);

    props = {status: 'draft', userId: user[User.idAttribute]};
    debug('create', Post.name, props);
    const post = await adapter.create(Post, props);
    debug('created', Post.name, post);

    props = {status: 'published', userId: user[User.idAttribute]};
    debug('create', Post.name, props);
    const post2 = await adapter.create(Post, props);
    debug('created', Post.name, post2);

    props = {status: 'draft', userId: user2[User.idAttribute]};
    debug('create', Post.name, props);
    const post3 = await adapter.create(Post, props);
    debug('created', Post.name, post3);

    props = {status: 'published', userId: user2[User.idAttribute]};
    debug('create', Post.name, props);
    const post4 = await adapter.create(Post, props);
    debug('created', Post.name, post4);

    debug('find', User.name, user[User.idAttribute]);
    user = await adapter.find(User, user[User.idAttribute], {with: ['post']});
    debug('found', User.name, user);

    expect(user).toBeDefined();
    expect(user.posts).toBeDefined();
    expect(user.posts.length).toEqual(2);

    debug('find', User.name, user[User.idAttribute]);
    user = await adapter.find(User, user[User.idAttribute], {
      with: [
        {
          relation: 'post',
          query: {
            status: 'published'
          }
        }
      ]
    });
    debug('found', User.name, user);

    expect(user).toBeDefined();
    expect(user.posts).toBeDefined();
    expect(user.posts.length).toEqual(1);

    debug('find', User.name, user[User.idAttribute]);
    user = await adapter.find(User, user[User.idAttribute], {
      with: [
        {
          relation: 'post',
          replace: true,
          query: {
            status: 'published'
          }
        }
      ]
    });
    debug('found', User.name, user);

    expect(user).toBeDefined();
    expect(user.posts).toBeDefined();
    expect(user.posts.length).toEqual(2);
  });

  if (options.hasFeature('findBelongsToNested')) {
    it('should load belongsTo relations (nested)', async () => {
      toClear.push('Post');
      toClear.push('Comment');
      toClear.push('Profile');
      let props: any = {name: 'John'};
      debug('create', User.name, props);
      const user = await adapter.create(User, props);
      debug('created', User.name, user);

      props = {email: 'foo@test.com', userId: user[User.idAttribute]};
      debug('create', Profile.name, props);
      const profile = await adapter.create(Profile, props);
      debug('created', Profile.name, profile);

      props = {content: 'foo', userId: user[User.idAttribute]};
      debug('create', Post.name, props);
      const post = await adapter.create(Post, props);
      debug('created', Post.name, post);

      props = {
        content: 'test2',
        postId: post[Post.idAttribute],
        userId: post.userId
      };
      debug('create', Comment.name, props);
      let comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      debug('find', Comment.name, comment[Comment.idAttribute]);
      comment = await adapter.find(Comment, comment[Comment.idAttribute], {
        with: ['user', 'user.profile', 'post', 'post.user']
      });
      debug('found', Comment.name, comment);

      expect(comment).toBeDefined();
      expect(comment.post).toBeDefined();
      expect(comment.post.user).toBeDefined();
      expect(comment.user).toBeDefined();
      expect(comment.user.profile).toBeDefined();
    });
  }

  it('should load hasMany and belongsTo relations', async () => {
    toClear.push('Post');
    toClear.push('Comment');
    toClear.push('Profile');
    let props: any = {name: 'John'};
    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    props = {email: 'foo@test.com', userId: user[User.idAttribute]};
    debug('create', Profile.name, props);
    const profile = await adapter.create(Profile, props);
    debug('created', Profile.name, profile);

    props = {content: 'foo', userId: user[User.idAttribute]};
    debug('create', Post.name, props);
    let post = await adapter.create(Post, props);
    const postId = post[Post.idAttribute];
    debug('created', Post.name, post);

    props = {content: 'test2', postId, userId: post.userId};
    debug('create', Comment.name, props);
    const comment = await adapter.create(Comment, props);
    debug('created', Comment.name, comment);

    debug('find', Post.name, postId);
    post = await adapter.find(Post, postId, {with: ['user', 'comment']});
    debug('found', Post.name, post);

    expect(post.comments).toBeDefined();
    expect(post.user).toBeDefined();
  });

  if (options.hasFeature('findBelongsToHasManyNested')) {
    it('should load hasMany and belongsTo relations (nested)', async () => {
      toClear.push('Post');
      toClear.push('Comment');
      toClear.push('Profile');
      let props: any = {name: 'John'};
      debug('create', User.name, props);
      const user = await adapter.create(User, props);
      debug('created', User.name, user);

      props = {email: 'foo@test.com', userId: user[User.idAttribute]};
      debug('create', Profile.name, props);
      const profile = await adapter.create(Profile, props);
      debug('created', Profile.name, profile);

      props = {content: 'foo', userId: user[User.idAttribute]};
      debug('create', Post.name, props);
      let post = await adapter.create(Post, props);
      const postId = post[Post.idAttribute];
      debug('created', Post.name, post);

      props = {content: 'test2', postId, userId: post.userId};
      debug('create', Comment.name, props);
      const comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      debug('find', Post.name, postId);
      post = await adapter.find(Post, postId, {
        with: ['user', 'comment', 'comment.user', 'comment.user.profile']
      });
      debug('found', Post.name, post);

      expect(post.comments).toBeDefined();
      expect(post.comments[0].user).toBeDefined();
      expect(post.comments[0].user.profile).toBeDefined();
      expect(post.user).toBeDefined();
    });
  }

  if (options.hasFeature('findHasManyLocalKeys')) {
    it('should load hasMany localKeys (array) relations', async () => {
      toClear.push('Post');
      toClear.push('Tag');
      let props: any = {value: 'big data'};
      debug('create', Tag.name, props);
      const tag = await adapter.create(Tag, props);
      debug('created', Tag.name, tag);

      props = {value: 'servers'};
      debug('create', Tag.name, props);
      const tag2 = await adapter.create(Tag, props);
      debug('created', Tag.name, tag2);

      props = {
        content: 'test',
        tagIds: [tag[Tag.idAttribute], tag2[Tag.idAttribute]]
      };
      debug('create', Post.name, props);
      let post = await adapter.create(Post, props);
      const postId = post[Post.idAttribute];
      debug('created', Post.name, post);

      debug('find', Post.name, postId);
      post = await adapter.find(Post, postId, {with: ['tag']});
      debug('found', Post.name, post);

      expect(post.tags).toBeDefined();
      expect(post.content).toEqual('test');
      expect(post.tags[0][Tag.idAttribute]).toBeDefined();
      expect(post.tags[1][Tag.idAttribute]).toBeDefined();
    });
    it('should load hasMany localKeys (empty array) relations', async () => {
      toClear.push('Post');
      const props = {content: 'test'};
      debug('create', Post.name, props);
      let post = await adapter.create(Post, props);
      const postId = post[Post.idAttribute];
      debug('created', Post.name, post);

      debug('find', Post.name, postId);
      post = await adapter.find(Post, postId, {with: ['tag']});
      debug('found', Post.name, post);

      expect(post.tags).toBeDefined();
      expect(post.content).toEqual('test');
      expect(post.tags).toEqual([]);
    });
    it('should load hasMany localKeys (object) relations', async () => {
      toClear.push('Post');
      toClear.push('Tag');
      let props: any = {value: 'big data'};
      debug('create', Tag.name, props);
      const tag = await adapter.create(Tag, props);
      debug('created', Tag.name, tag);

      props = {value: 'servers'};
      debug('create', Tag.name, props);
      const tag2 = await adapter.create(Tag, props);
      debug('created', Tag.name, tag2);

      props = {
        content: 'test',
        tagIds: {[tag[Tag.idAttribute]]: true, [tag2[Tag.idAttribute]]: true}
      };
      debug('create', Post.name, props);
      let post = await adapter.create(Post, props);
      const postId = post[Post.idAttribute];
      debug('created', Post.name, post);

      debug('find', Post.name, postId);
      post = await adapter.find(Post, postId, {with: ['tag']});
      debug('found', Post.name);

      expect(post.tags).toBeDefined();
      expect(post.content).toEqual('test');
      expect(post.tags[0][Tag.idAttribute]).toBeDefined();
      expect(post.tags[1][Tag.idAttribute]).toBeDefined();
    });
  }

  if (options.hasFeature('findHasManyForeignKeys')) {
    it('should load hasMany foreignKeys (array) relations', async () => {
      toClear.push('Post');
      toClear.push('Tag');
      let props: any = {value: 'big data'};
      debug('create', Tag.name, props);
      let tag = await adapter.create(Tag, props);
      const tagId = tag[Tag.idAttribute];
      debug('created', Tag.name, tag);

      props = {value: 'servers'};
      debug('create', Tag.name, props);
      let tag2 = await adapter.create(Tag, props);
      const tag2Id = tag2[Tag.idAttribute];
      debug('created', Tag.name, tag2);

      props = {content: 'test', tagIds: [tagId]};
      debug('create', Post.name, props);
      const post = await adapter.create(Post, props);
      debug('created', Post.name, post);

      props = {content: 'test2', tagIds: [tagId, tag2Id]};
      debug('create', Post.name, props);
      const post2 = await adapter.create(Post, props);
      debug('created', Post.name, post2);

      debug('find', Tag.name, tagId);
      tag = await adapter.find(Tag, tagId, {with: ['post']});
      debug('found', Tag.name, tag);

      expect(tag.posts).toBeDefined();
      expect(tag.value).toEqual('big data');
      expect(tag.posts.length).toEqual(2);

      debug('find', Tag.name, tag2Id);
      tag2 = await adapter.find(Tag, tag2Id, {with: ['post']});
      debug('found', Tag.name, tag2);

      expect(tag2.posts).toBeDefined();
      expect(tag2.value).toEqual('servers');
      expect(tag2.posts.length).toEqual(1);
      objectsEqual(tag2.posts, [post2], 'tag2.posts');
    });
  }
});
