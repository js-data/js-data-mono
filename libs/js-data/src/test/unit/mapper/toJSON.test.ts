import { JSData, objectsEqual, store, User } from '../../_setup';

describe('Mapper#toJSON', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'user'});
    expect(typeof mapper.toJSON).toEqual('function');
    expect(mapper.toJSON).toBe(Mapper.prototype.toJSON);
  });
  it('should make json when not an instance', function () {
    const props = {name: 'John'};
    expect(User.toJSON(props)).toEqual(props);

    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          id: {type: 'number'},
          name: {type: 'string'}
        }
      }
    });
    const CommentMapper = new JSData.Mapper({
      name: 'comment'
    });
    JSData.belongsTo(UserMapper, {
      localField: 'user',
      foreignKey: 'userId'
    })(UserMapper);
    JSData.hasMany(CommentMapper, {
      localField: 'comments',
      foreignKey: 'userId'
    })(UserMapper);

    expect(UserMapper.toJSON(
      {
        name: 'John',
        id: 1,
        comments: [{userId: 1}]
      },
      {with: 'comments'}
    )).toEqual({
      name: 'John',
      id: 1,
      comments: [{userId: 1}]
    });
  });
  it('should strictly keep schema props', () => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      }
    });
    const json = UserMapper.toJSON(
      {
        name: 'John',
        age: 30,
        foo: 'bar'
      },
      {strict: true}
    );
    expect(json).toEqual({
      name: 'John',
      age: 30
    });
  });
  it('should allow custom getters/setters', () => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          first: {type: 'string'},
          last: {type: 'string'},
          name: {
            type: 'string',
            get() {
              return `${this.first} ${this.last}`;
            },
            set(value) {
              const parts = value.split(' ');
              this.first = parts[0] || this.first;
              this.last = parts[1] || this.last;
            }
          },
          age: {type: 'number'}
        }
      }
    });
    const user = UserMapper.createRecord({
      first: 'John',
      last: 'Anderson'
    });
    expect(user.name).toEqual('John Anderson');
  });
  it('should make json when the record class does not have a mapper', () => {
    const props = {name: 'John'};
    const record = new JSData.Record(props);
    expect(record.toJSON()).not.toBe(props);
    expect(record.toJSON()).toEqual(props);
  });
  it('should make json when an instance', function () {
    const props = {name: 'John', organizationId: 5};
    const user = User.createRecord(props);
    expect(User.toJSON(user) !== props).toBeTruthy();
    expect(User.toJSON(user)).toEqual(props);
    expect(user.toJSON()).toEqual(props);
  });
  it('should keep only enumerable properties', function () {
    const props = {name: 'John'};
    const user = User.createRecord(props);
    Object.defineProperty(user, 'foo', {
      enumerable: true,
      value: 'foo'
    });
    Object.defineProperty(user, 'bar', {
      enumerable: false,
      value: 'bar'
    });
    expect(User.toJSON(user) !== props).toBeTruthy();
    const expected = {
      name: 'John',
      foo: 'foo'
    };
    expect(User.toJSON(user)).toEqual(expected);
    expect(user.toJSON()).toEqual(expected);
  });
  it('should work when not a Record instance', function () {
    const user = {
      name: 'John',
      organization: {
        name: 'Company Inc.'
      },
      comments: [
        {
          text: 'foo'
        },
        {
          text: 'bar'
        }
      ]
    };
    expect(User.toJSON(user)).toEqual({name: 'John'});
    expect(User.toJSON(user, {withAll: true})).toEqual(user);
  });
  it('should remove relations when an instance', () => {
    const user = store.add('user', {
      name: 'John',
      id: 1,
      organization: {
        name: 'Company Inc.',
        id: 2
      },
      comments: [
        {
          text: 'foo',
          id: 3,
          approvedByUser: {
            name: 'Sally',
            id: 5,
            organization: {
              name: 'Group Inc.',
              id: 6
            }
          }
        },
        {
          id: 4,
          text: 'bar'
        }
      ]
    });
    expect(User.toJSON(user) !== user).toBeTruthy();
    expect(user.toJSON() !== user).toBeTruthy();
    const expected = {
      id: 1,
      name: 'John',
      organizationId: 2
    };
    expect(User.toJSON(user)).toEqual(expected);
    expect(user.toJSON()).toEqual(expected);
  });
  it('should keep specified relations when an instance', function () {
    const user = store.add('user', {
      name: 'John',
      id: 1,
      organization: {
        name: 'Company Inc.',
        id: 2
      },
      comments: [
        {
          text: 'foo',
          id: 3,
          approvedByUser: {
            name: 'Sally',
            id: 5,
            organization: {
              name: 'Group Inc.',
              id: 6
            }
          }
        },
        {
          id: 4,
          text: 'bar'
        }
      ]
    });
    let expected: any = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON()
    };

    expect(User.toJSON(user, {
      with: ['organization']
    })).toEqual(expected);
    expect(user.toJSON({
      with: ['organization']
    })).toEqual(expected);

    expected = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON(),
      comments: user.comments.map(comment => comment.toJSON())
    };

    expect(User.toJSON(user, {
      with: ['organization', 'comments']
    })).toEqual(expected);
    expect(user.toJSON({
      with: ['organization', 'comments']
    })).toEqual(expected);

    expected = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON(),
      comments: [
        {
          id: 3,
          userId: 1,
          text: 'foo',
          approvedBy: 5,
          approvedByUser: store.get('user', 5).toJSON()
        },
        store.get('comment', 4)
      ]
    };

    objectsEqual(
      User.toJSON(user, {
        with: ['organization', 'comments', 'comments.approvedByUser']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser'
    );
    objectsEqual(
      user.toJSON({
        with: ['organization', 'comments', 'comments.approvedByUser']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser'
    );

    expected = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON(),
      comments: [
        {
          id: 3,
          userId: 1,
          text: 'foo',
          approvedBy: 5,
          approvedByUser: {
            name: 'Sally',
            id: 5,
            organizationId: 6,
            organization: store.get('organization', 6).toJSON()
          }
        },
        store.get('comment', 4).toJSON()
      ]
    };

    expect(User.toJSON(user, {
      with: ['organization', 'comments', 'comments.approvedByUser', 'comments.approvedByUser.organization']
    })).toEqual(expected);

    expect(user.toJSON({
      with: ['organization', 'comments', 'comments.approvedByUser', 'comments.approvedByUser.organization']
    })).toEqual(expected);
  });
});
