import { options, debug, $$adapter, $$User, $$Profile, $$Post, $$Comment, toClear, objectsEqual } from './index';

describe('Adapter#findAll', () => {
  let adapter, User, Profile, Post, Comment;

  beforeEach(() => {
    adapter = $$adapter;
    User = $$User;
    Profile = $$Profile;
    Post = $$Post;
    Comment = $$Comment;
  });

  it('should exist', () => {
    expect(typeof adapter.findAll).toEqual('function');
  });

  it('should filter users', async () => {
    const props = {name: 'John'};
    debug('findAll', User.name, {age: 30});
    const users = await adapter.findAll(User, {age: 30});
    debug('found', User.name, users);
    expect(users.length).toEqual(0);

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);
    const userId = user[User.idAttribute];

    debug('findAll', User.name, {name: 'John'});
    const users2 = await adapter.findAll(User, {name: 'John'});
    debug('found', User.name, users2);

    expect(users2.length).toEqual(1);
    expect(users2[0][User.idAttribute]).toEqual(userId);
    expect(users2[0].name).toEqual('John');
  });

  it('should filter users with raw option', async () => {
    const props = {name: 'John'};
    debug('findAll', User.name, {age: 30});
    const result = await adapter.findAll(User, {age: 30}, {raw: true});
    const users = result.data;
    debug('found', User.name, users);
    expect(users.length).toEqual(0);

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);
    const userId = user[User.idAttribute];

    debug('findAll', User.name, {name: 'John'});
    const result2 = await adapter.findAll(
      User,
      {name: 'John'},
      {raw: true}
    );
    const users2 = result2.data;
    debug('found', User.name, users2);

    expect(users2.length).toEqual(1);
    expect(users2[0][User.idAttribute]).toEqual(userId);
    expect(users2[0].name).toEqual('John');
  });

  if (options.hasFeature('findAllInOp')) {
    it('should filter users using the "in" operator', async () => {
      const users = await adapter.findAll(User, {
        where: {
          age: {
            in: [30]
          }
        }
      });
      expect(users.length).toEqual(0);

      const user = await adapter.create(User, {name: 'John'});
      const id = user[User.idAttribute];

      const users2 = await adapter.findAll(User, {name: 'John'});
      expect(users2.length).toEqual(1);
      expect(users2[0][User.idAttribute]).toEqual(id);
      expect(users2[0].name).toEqual('John');
    });
  }

  if (options.hasFeature('findAllLikeOp')) {
    it('should filter users using the "like" operator', async () => {
      const users = await adapter.findAll(User, {
        where: {
          name: {
            like: '%J%'
          }
        }
      });
      expect(users.length).toEqual(0);

      const user = await adapter.create(User, {name: 'John'});
      const id = user.id;

      const users2 = await adapter.findAll(User, {
        where: {
          name: {
            like: '%J%'
          }
        }
      });
      expect(users2.length).toEqual(1);
      expect(users2[0].id).toEqual(id);
      expect(users2[0].name).toEqual('John');
    });
  }

  if (options.hasFeature('findAllOpNotFound')) {
    it('should throw "Operator not found" error', () => {
      return adapter
        .findAll(User, {
          where: {
            name: {
              op: 'John'
            }
          }
        })
        .then(
          () => {
            throw new Error('should have failed!');
          },
          err => {
            expect(err.message).toEqual('Operator op not supported!');
          }
        );
    });
  }

  if (options.hasFeature('findAllBelongsTo')) {
    it('should load belongsTo relations', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
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
      const comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      props = {name: 'Sally'};
      debug('create', User.name, props);
      const user2 = await adapter.create(User, props);
      debug('created', User.name, user2);

      props = {content: 'bar', userId: user2[User.idAttribute]};
      debug('create', Post.name, props);
      const post2 = await adapter.create(Post, props);
      debug('created', Post.name, post2);

      props = {
        content: 'test67',
        postId: post2[Post.idAttribute],
        userId: post2.userId
      };
      debug('create', Comment.name, props);
      const comment2 = await adapter.create(Comment, props);
      debug('created', Comment.name, comment2);

      debug('findAll', Comment.name, {});
      const comments = await adapter.findAll(
        Comment,
        {},
        {with: ['user', 'post']}
      );
      debug('found', Comment.name, comments);

      expect(comments[0].post).toBeDefined();
      expect(comments[0].user).toBeDefined();
      expect(comments[1].post).toBeDefined();
      expect(comments[1].user).toBeDefined();
    });

    it('should load belongsTo relations and filter sub queries', async () => {
      toClear.push('Post');
      toClear.push('Comment');
      let props: any = {name: 'John'};
      debug('create', User.name, props);
      const user = await adapter.create(User, props);
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

      debug('findAll', User.name, {
        [User.idAttribute]: user[User.idAttribute]
      });
      let users = await adapter.findAll(
        User,
        {[User.idAttribute]: user[User.idAttribute]},
        {with: ['post']}
      );
      debug('found', User.name, users);

      expect(users).toBeDefined();
      expect(users[0].posts).toBeDefined();
      expect(users[0].posts.length).toEqual(2);

      debug('findAll', User.name, {
        [User.idAttribute]: user[User.idAttribute]
      });
      users = await adapter.findAll(
        User,
        {[User.idAttribute]: user[User.idAttribute]},
        {
          with: [
            {
              relation: 'post',
              query: {
                status: 'published'
              }
            }
          ]
        }
      );
      debug('found', User.name, users);

      expect(users).toBeDefined();
      expect(users[0].posts).toBeDefined();
      expect(users[0].posts.length).toEqual(1);

      debug('findAll', User.name, {
        [User.idAttribute]: user[User.idAttribute]
      });
      users = await adapter.findAll(
        User,
        {[User.idAttribute]: user[User.idAttribute]},
        {
          with: [
            {
              relation: 'post',
              replace: true,
              query: {
                status: 'published'
              }
            }
          ]
        }
      );
      debug('found', User.name, users);

      expect(user).toBeDefined();
      expect(users[0].posts).toBeDefined();
      expect(users[0].posts.length).toEqual(1);
    });
  }

  if (options.hasFeature('findAllBelongsToNested')) {
    it('should load belongsTo relations (nested)', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
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
      const comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      props = {name: 'Sally'};
      debug('create', User.name, props);
      const user2 = await adapter.create(User, props);
      debug('created', User.name, user2);

      props = {content: 'bar', userId: user2[User.idAttribute]};
      debug('create', Post.name, props);
      const post2 = await adapter.create(Post, props);
      debug('created', Post.name, post2);

      props = {
        content: 'test67',
        postId: post2[Post.idAttribute],
        userId: post2.userId
      };
      debug('create', Comment.name, props);
      const comment2 = await adapter.create(Comment, props);
      debug('created', Comment.name, comment2);

      debug('findAll', Comment.name, {});
      const comments = await adapter.findAll(
        Comment,
        {},
        {with: ['user', 'user.profile', 'post', 'post.user']}
      );
      debug('found', Comment.name, comments);

      expect(comments[0].post).toBeDefined();
      expect(comments[0].post.user).toBeDefined();
      expect(comments[0].user).toBeDefined();
      expect(
        comments[0].user.profile || comments[1].user.profile
      ).toBeDefined();
      expect(comments[1].post).toBeDefined();
      expect(comments[1].post.user).toBeDefined();
      expect(comments[1].user).toBeDefined();
    });
  }

  if (options.hasFeature('findAllBelongsToHasMany')) {
    it('should load hasMany and belongsTo relations', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
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
      const comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      props = {name: 'Sally'};
      debug('create', User.name, props);
      const user2 = await adapter.create(User, props);
      debug('created', User.name, user2);

      props = {content: 'bar', userId: user2[User.idAttribute]};
      debug('create', Post.name, props);
      const post2 = await adapter.create(Post, props);
      debug('created', Post.name, post2);

      props = {
        content: 'test67',
        postId: post2[Post.idAttribute],
        userId: post2.userId
      };
      debug('create', Comment.name, props);
      const comment2 = await adapter.create(Comment, props);
      debug('created', Comment.name, comment2);

      debug('find', Post.name, {});
      const posts = await adapter.findAll(
        Post,
        {},
        {with: ['user', 'comment']}
      );
      debug('found', Post.name, posts);

      expect(posts[0].comments).toBeDefined();
      expect(posts[0].user).toBeDefined();
      expect(posts[1].comments).toBeDefined();
      expect(posts[1].user).toBeDefined();
    });
  }

  if (options.hasFeature('findAllBelongsToHasManyNested')) {
    it('should load hasMany and belongsTo relations', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
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
      const comment = await adapter.create(Comment, props);
      debug('created', Comment.name, comment);

      props = {name: 'Sally'};
      debug('create', User.name, props);
      const user2 = await adapter.create(User, props);
      debug('created', User.name, user2);

      props = {content: 'bar', userId: user2[User.idAttribute]};
      debug('create', Post.name, props);
      const post2 = await adapter.create(Post, props);
      debug('created', Post.name, post2);

      props = {
        content: 'test67',
        postId: post2[Post.idAttribute],
        userId: post2.userId
      };
      debug('create', Comment.name, props);
      const comment2 = await adapter.create(Comment, props);
      debug('created', Comment.name, comment2);

      debug('find', Post.name, {});
      const posts = await adapter.findAll(
        Post,
        {},
        {with: ['user', 'comment', 'comment.user', 'comment.user.profile']}
      );
      debug('found', Post.name, posts);

      expect(posts[0].comments).toBeDefined();
      expect(posts[0].comments[0].user).toBeDefined();
      expect(
        posts[0].comments[0].user.profile || posts[1].comments[0].user.profile
      ).toBeDefined();
      expect(posts[0].user).toBeDefined();
      expect(posts[1].comments).toBeDefined();
      expect(posts[1].comments[0].user).toBeDefined();
      expect(posts[1].user).toBeDefined();
    });
  }

  if (options.hasFeature('filterOnRelations')) {
    it('should filter using belongsTo relation', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
      const profile1 = await adapter.create(Profile, {email: 'foo@test.com'});
      const user1 = await adapter.create(User, {
        name: 'John',
        profileId: profile1.id
      });

      const post1 = await adapter.create(Post, {
        content: 'foo',
        userId: user1.id
      });
      await adapter.create(Comment, {
        content: 'test1',
        postId: post1.id,
        userId: post1.userId
      });

      const user2 = await adapter.create(User, {name: 'Sally'});
      const post2 = await adapter.create(Post, {
        content: 'bar',
        userId: user2.id
      });
      await adapter.create(Comment, {
        content: 'test2',
        postId: post2.id,
        userId: post2.userId
      });

      const users = await adapter.findAll(User, {
        'profile.email': 'foo@test.com'
      });
      expect(users.length).toEqual(1);
      expect(users[0].profileId).toEqual(profile1.id);
      expect(users[0].name).toEqual('John');
    });

    it('should filter through multiple hasOne/belongsTo relations', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
      const profile1 = await adapter.create(Profile, {email: 'foo@test.com'});
      const user1 = await adapter.create(User, {
        name: 'John',
        profileId: profile1.id
      });

      const post1 = await adapter.create(Post, {
        content: 'foo',
        userId: user1.id
      });
      await adapter.create(Comment, {
        content: 'test1',
        postId: post1.id,
        userId: post1.userId
      });

      const profile2 = await adapter.create(Profile, {email: 'bar@test.com'});
      const user2 = await adapter.create(User, {
        name: 'Sally',
        profileId: profile2.id
      });
      const post2 = await adapter.create(Post, {
        content: 'bar',
        userId: user2.id
      });
      await adapter.create(Comment, {
        content: 'test2',
        postId: post2.id,
        userId: post2.userId
      });

      const comments = await adapter.findAll(Comment, {
        'user.profile.email': 'foo@test.com'
      });
      expect(comments.length).toEqual(1);
      expect(comments[0].userId).toEqual(user1.id);
      expect(comments[0].content).toEqual('test1');
    });

    it('should filter using multiple hasOne/belongsTo relations', async () => {
      toClear.push('Post');
      toClear.push('Profile');
      toClear.push('Comment');
      const profile1 = await adapter.create(Profile, {email: 'foo@test.com'});
      const user1 = await adapter.create(User, {
        name: 'John',
        profileId: profile1.id
      });

      const post1 = await adapter.create(Post, {
        content: 'foo',
        userId: user1.id
      });
      await adapter.create(Comment, {
        content: 'test1',
        postId: post1.id,
        userId: post1.userId
      });

      const profile2 = await adapter.create(Profile, {email: 'bar@test.com'});
      const user2 = await adapter.create(User, {
        name: 'Sally',
        profileId: profile2.id
      });
      const post2 = await adapter.create(Post, {
        content: 'bar',
        userId: user2.id
      });
      await adapter.create(Comment, {
        content: 'test2',
        postId: post2.id,
        userId: post2.userId
      });

      const comments = await adapter.findAll(Comment, {
        'user.name': 'John',
        'user.profile.email': 'foo@test.com'
      });
      expect(comments.length).toEqual(1);
      expect(comments[0].userId).toEqual(user1.id);
      expect(comments[0].content).toEqual('test1');
    });
  }

  it('should allow passing limit and offset as strings', async () => {
    await adapter.findAll(User, {limit: '10', offset: '20'});
  });

  if (options.hasFeature('findAllGroupedWhere')) {
    it('should support filtering grouped "where" clauses', async () => {
      toClear.push('Post');
      const posts = await adapter.createMany(Post, [
        {status: 'draft', content: 'foo'},
        {status: 'broken', content: 'bar'},
        {status: 'published', content: 'hi'},
        {status: 'flagged', content: 'hello world'},
        {status: 'flagged', content: 'test'}
      ]);

      const query = {
        where: [
          [
            {
              content: {
                '=': 'foo'
              },
              status: {
                '=': 'draft'
              }
            },
            'or',
            {
              status: {
                '=': 'published'
              }
            }
          ],
          'or',
          {
            content: {
              '=': 'test'
            },
            status: {
              '=': 'flagged'
            }
          }
        ],
        orderBy: 'status'
      };

      objectsEqual(await adapter.findAll(Post, query), [
        posts[0],
        posts[4],
        posts[2]
      ]);
    });
  }
});
