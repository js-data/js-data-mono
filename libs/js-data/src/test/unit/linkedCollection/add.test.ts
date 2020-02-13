import {
  CommentCollection,
  data,
  GroupCollection,
  JSData,
  objectsEqual,
  OrganizationCollection,
  ProfileCollection,
  store,
  UserCollection
} from '../../_setup';

describe('LinkedCollection#add', () => {
  it('should add', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const collection = store.getCollection('user');
    const user = collection.add({id: 1});
    expect(user.id).toEqual(1);
  });
  it('should inject relations', () => {
    // can inject items without relations
    UserCollection.add(data.user1);
    OrganizationCollection.add(data.organization2);
    CommentCollection.add(data.comment3);
    ProfileCollection.add(data.profile4);

    expect(UserCollection.get(1).id).toEqual(data.user1.id);
    expect(OrganizationCollection.get(2).id).toEqual(data.organization2.id);
    expect(CommentCollection.get(3).id).toEqual(data.comment3.id);
    expect(ProfileCollection.get(4).id).toEqual(data.profile4.id);

    // can inject items with relations
    UserCollection.add(data.user10);
    OrganizationCollection.add(data.organization15);
    CommentCollection.add(data.comment19);
    ProfileCollection.add(data.profile21);
    GroupCollection.add(data.group1);

    // originals
    expect(UserCollection.get(10).name).toEqual(data.user10.name);
    expect(UserCollection.get(10).id).toEqual(data.user10.id);
    expect(UserCollection.get(10).organizationId).toEqual(data.user10.organizationId);
    expect(Array.isArray(UserCollection.get(10).comments)).toBeTruthy();
    expect(OrganizationCollection.get(15).name).toEqual(data.organization15.name);
    expect(OrganizationCollection.get(15).id).toEqual(data.organization15.id);
    expect(Array.isArray(OrganizationCollection.get(15).users)).toBeTruthy();
    expect(CommentCollection.get(19).id).toEqual(data.comment19.id);
    expect(CommentCollection.get(19).content).toEqual(data.comment19.content);
    expect(ProfileCollection.get(21).id).toEqual(data.profile21.id);
    expect(ProfileCollection.get(21).content).toEqual(data.profile21.content);
    expect(GroupCollection.get(1).id).toEqual(data.group1.id);
    expect(GroupCollection.get(1).name).toEqual(data.group1.name);
    expect(Array.isArray(GroupCollection.get(1).userIds)).toBeTruthy();

    // user10 relations
    expect(CommentCollection.get(11)).toEqual(UserCollection.get(10).comments[0]);
    expect(CommentCollection.get(12)).toEqual(UserCollection.get(10).comments[1]);
    expect(CommentCollection.get(13)).toEqual(UserCollection.get(10).comments[2]);
    expect(OrganizationCollection.get(14)).toEqual(UserCollection.get(10).organization);
    expect(ProfileCollection.get(15)).toEqual(UserCollection.get(10).profile);
    expect(Array.isArray(UserCollection.get(10).groups)).toBeTruthy();
    expect(UserCollection.get(10).groups[0]).toEqual(GroupCollection.get(1));

    // group1 relations
    expect(Array.isArray(GroupCollection.get(1).users)).toBeTruthy();
    expect(GroupCollection.get(1).users[0]).toEqual(UserCollection.get(10));

    // organization15 relations
    expect(UserCollection.get(16)).toEqual(OrganizationCollection.get(15).users[0]);
    expect(UserCollection.get(17)).toEqual(OrganizationCollection.get(15).users[1]);
    expect(UserCollection.get(18)).toEqual(OrganizationCollection.get(15).users[2]);

    // comment19 relations
    expect(UserCollection.get(20)).toEqual(CommentCollection.get(19).user);
    expect(UserCollection.get(19)).toEqual(CommentCollection.get(19).approvedByUser);

    // profile21 relations
    expect(UserCollection.get(22)).toEqual(ProfileCollection.get(21).user);
  });
  it('should inject localKeys relations', () => {
    const group = store.add('group', {
      id: 1,
      users: {
        id: 1
      }
    });
    expect(group).toBe(store.get('group', 1));
    expect(group.users[0]).toBe(store.get('user', 1));
  });
  it('should find inverse links', () => {
    UserCollection.add({organizationId: 5, id: 1});
    OrganizationCollection.add({id: 5});

    expect(UserCollection.get(1).organization).toEqual({id: 5});

    expect(UserCollection.get(1).comments).toEqual([]);
    expect(UserCollection.get(1).approvedComments).toEqual([]);

    CommentCollection.add({approvedBy: 1, id: 23});

    expect(0).toEqual(UserCollection.get(1).comments.length);
    expect(1).toEqual(UserCollection.get(1).approvedComments.length);

    CommentCollection.add({approvedBy: 1, id: 44});

    expect(0).toEqual(UserCollection.get(1).comments.length);
    expect(2).toEqual(UserCollection.get(1).approvedComments.length);
  });
  it('should inject cyclic dependencies', () => {
    const store = new JSData.DataStore({
      linkRelations: true
    });
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          foo: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        },
        belongsTo: {
          foo: {
            localField: 'parent',
            foreignKey: 'parentId'
          }
        }
      }
    });
    const injected = store.getCollection('foo').add([
      {
        id: 1,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [
              {
                id: 4,
                parentId: 2
              },
              {
                id: 5,
                parentId: 2
              }
            ]
          },
          {
            id: 3,
            parentId: 1,
            children: [
              {
                id: 6,
                parentId: 3
              },
              {
                id: 7,
                parentId: 3
              }
            ]
          }
        ]
      }
    ]);

    expect(injected[0].id).toEqual(1);
    expect(injected[0].children[0].id).toEqual(2);
    expect(injected[0].children[1].id).toEqual(3);
    expect(injected[0].children[0].children[0].id).toEqual(4);
    expect(injected[0].children[0].children[1].id).toEqual(5);
    expect(injected[0].children[1].children[0].id).toEqual(6);
    expect(injected[0].children[1].children[1].id).toEqual(7);

    expect(store.getCollection('foo').get(1)).toBeTruthy();
    expect(store.getCollection('foo').get(2)).toBeTruthy();
    expect(store.getCollection('foo').get(3)).toBeTruthy();
    expect(store.getCollection('foo').get(4)).toBeTruthy();
    expect(store.getCollection('foo').get(5)).toBeTruthy();
    expect(store.getCollection('foo').get(6)).toBeTruthy();
    expect(store.getCollection('foo').get(7)).toBeTruthy();
  });
  it('should work when injecting child relations multiple times', () => {
    const store = new JSData.DataStore({
      linkRelations: true
    });
    store.defineMapper('parent', {
      relations: {
        hasMany: {
          child: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        }
      }
    });
    const Child = store.defineMapper('child', {
      relations: {
        belongsTo: {
          parent: {
            localField: 'parent',
            foreignKey: 'parentId'
          }
        }
      }
    });
    store.add('parent', {
      id: 1,
      name: 'parent1',
      children: [
        {
          id: 1,
          name: 'child1'
        }
      ]
    });

    expect(store.get('parent', 1).children[0] instanceof Child.recordClass).toBeTruthy();

    store.add('parent', {
      id: 1,
      name: 'parent',
      children: [
        {
          id: 1,
          name: 'Child-1'
        },
        {
          id: 2,
          name: 'Child-2'
        }
      ]
    });

    expect(store.get('parent', 1).children[0] instanceof Child.recordClass).toBeTruthy();
    expect(store.get('parent', 1).children[1] instanceof Child.recordClass).toBeTruthy();
    expect(store.filter('child', {parentId: 1})).toEqual(store.get('parent', 1).children);
  });

  it('should not auto-add relations where auto-add has been disabled', () => {
    const store = new JSData.DataStore({
      linkRelations: false
    });
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId',
            add: false
          }
        }
      }
    });
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId'
          }
        }
      }
    });
    const bar1Json = {
      id: 1
    };
    const bar2Json = {
      id: 2
    };
    const foo = store.add('foo', {
      id: 1,
      bars: [bar1Json, bar2Json]
    });
    expect(foo.bars[0].fooId).toEqual(1);
    expect(foo.bars[1].fooId).toEqual(1);
    expect(foo.bars.length).toEqual(2);
    expect(store.getAll('bar')).toEqual([]);
  });
  it('should allow custom relation injection logic', () => {
    const store = new JSData.DataStore({
      linkRelations: true
    });
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId',
            add(store, relationDef, foo) {
              const bars = store.add(relationDef.relation, foo.test_bars);
              bars.forEach(bar => {
                bar.beep = 'boop';
              });
              delete foo.test_bars;
            }
          }
        }
      }
    });
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId'
          }
        }
      }
    });
    const foo = store.add('foo', {
      id: 1,
      test_bars: [
        {
          id: 1,
          fooId: 1
        },
        {
          id: 2,
          fooId: 1
        }
      ]
    });
    objectsEqual(
      foo.bars,
      [
        {
          id: 1,
          fooId: 1,
          beep: 'boop'
        },
        {
          id: 2,
          fooId: 1,
          beep: 'boop'
        }
      ],
      'bars should have been added'
    );
  });
  it('should update links', () => {
    const store = new JSData.DataStore();
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    });
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId'
          }
        }
      }
    });
    const foo = store.add('foo', {
      id: 1,
      bars: [
        {
          id: 1,
          fooId: 1
        },
        {
          id: 2,
          fooId: 1
        }
      ]
    });
    store.add('bar', {
      id: 3,
      fooId: 1
    });
    expect(foo.bars.length).toEqual(3);
    expect(store.getAll('bar').length).toEqual(3);
  });
  it('should inject 1,000 items', () => {
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    // const start = new Date().getTime()
    UserCollection.add(users);
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  });
  it('should inject 1,000 items where there is an index on "age"', () => {
    const collection = new JSData.Collection({mapper: new JSData.Mapper({name: 'user'})});
    collection.createIndex('age');
    collection.createIndex('created');
    collection.createIndex('updated');
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    // const start = new Date().getTime()
    collection.add(users);
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  });
});
