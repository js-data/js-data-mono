import { CommentCollection, data, JSData, OrganizationCollection, ProfileCollection, UserCollection } from '../_setup';

describe('DataStore integration tests', () => {
  it('relation links should stay up-to-date', () => {
    const store = new JSData.DataStore();
    store.defineMapper('foo', {
      schema: {
        properties: {
          id: {type: 'number'}
        }
      },
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'foo_id'
          }
        }
      }
    });
    store.defineMapper('bar', {
      schema: {
        properties: {
          id: {type: 'number'},
          foo_id: {type: 'number'}
        }
      },
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'foo_id'
          }
        }
      }
    });
    const foo66 = store.add('foo', {
      id: 66
    });
    const foo77 = store.add('foo', {
      id: 77
    });
    const bar88 = store.add('bar', {
      id: 88,
      foo_id: 66
    });
    expect(bar88.foo).toBe(foo66);
    expect(foo66.bars[0]).toBe(bar88);
    expect(foo77.bars).toEqual([]);
    expect(bar88.foo_id).toEqual(66);
    bar88.foo_id = 77;
    expect(bar88.foo).toBe(foo77);
    expect(bar88.foo_id).toEqual(77);
    expect(foo77.bars[0]).toBe(bar88);
    expect(foo66.bars).toEqual([]);
    bar88.foo = foo66;
    expect(bar88.foo).toBe(foo66);
    expect(bar88.foo_id).toEqual(66);
    expect(foo66.bars[0]).toBe(bar88);
    expect(foo77.bars).toEqual([]);
    foo77.bars = [bar88];
    expect(foo77.bars[0]).toBe(bar88);
    expect(bar88.foo_id).toEqual(77);
    expect(foo66.bars).toEqual([]);
    foo66.bars = [bar88];
    expect(foo66.bars[0]).toBe(bar88);
    expect(bar88.foo_id).toEqual(66);
    expect(foo77.bars).toEqual([]);
  });
  it('should allow enhanced relation getters', () => {
    let wasItActivated = false;
    const store = new JSData.DataStore({
      linkRelations: true
    });
    store.defineMapper('foo', {
      relations: {
        belongsTo: {
          bar: {
            localField: 'bar',
            foreignKey: 'barId',
            get(def, foo, orig) {
              // "relation.name" has relationship "relation.type" to "relation.relation"
              wasItActivated = true;
              return orig();
            }
          }
        }
      }
    });
    store.defineMapper('bar', {
      relations: {
        hasMany: {
          foo: {
            localField: 'foos',
            foreignKey: 'barId'
          }
        }
      }
    });
    const foo = store.add('foo', {
      id: 1,
      barId: 1,
      bar: {
        id: 1
      }
    });
    expect(foo.bar.id).toEqual(1);
    expect(wasItActivated).toBeTruthy();
  });
  it('should configure enumerability and linking of relations', () => {
    const store = new JSData.DataStore();
    store.defineMapper('parent', {
      relations: {
        hasMany: {
          child: {
            localField: 'children',
            foreignKey: 'parentId'
          },
          otherChild: {
            localField: 'otherChildren',
            foreignKey: 'parentId'
          }
        }
      }
    });
    store.defineMapper('child', {
      relations: {
        belongsTo: {
          parent: {
            localField: 'parent',
            foreignKey: 'parentId'
          }
        }
      }
    });
    store.defineMapper('otherChild', {
      relations: {
        belongsTo: {
          parent: {
            enumerable: true,
            localField: 'parent',
            foreignKey: 'parentId'
          }
        }
      }
    });

    const child = store.add('child', {
      id: 1,
      parent: {
        id: 2
      }
    });

    const otherChild = store.add('otherChild', {
      id: 3,
      parent: {
        id: 4
      }
    });

    expect(store.get('child', child.id)).toBeTruthy();
    expect(child.parentId).toEqual(2);
    expect(child.parent === store.get('parent', child.parentId)).toBeTruthy();

    expect(store.get('otherChild', otherChild.id)).toBeTruthy();
    expect(otherChild.parentId).toEqual(4);
    expect(otherChild.parent === store.get('parent', otherChild.parentId)).toBeTruthy();
    expect(store.get('parent', otherChild.parentId)).toBeTruthy();

    let foundParent = false;
    let k;
    for (k in child) {
      if (k === 'parent' && child[k] === child.parent && child[k] === store.get('parent', child.parentId)) {
        foundParent = true;
      }
    }
    expect(!foundParent).toBeTruthy();
    foundParent = false;
    for (k in otherChild) {
      if (
        k === 'parent' &&
        otherChild[k] === otherChild.parent &&
        otherChild[k] === store.get('parent', otherChild.parentId)
      ) {
        foundParent = true;
      }
    }
    expect(foundParent).toBeTruthy();
  });
  it.skip('should unlink upon ejection', function () {
    UserCollection.add(data.user10);
    OrganizationCollection.add(data.organization15);
    CommentCollection.add(data.comment19);
    ProfileCollection.add(data.profile21);

    // user10 relations
    expect(Array.isArray(UserCollection.get(10).comments)).toBeTruthy();
    CommentCollection.remove(11);
    expect(!CommentCollection.get(11)).toBeTruthy();
    expect(UserCollection.get(10).comments.length).toEqual(2);
    CommentCollection.remove(12);
    expect(!CommentCollection.get(12)).toBeTruthy();
    expect(UserCollection.get(10).comments.length).toEqual(1);
    CommentCollection.remove(13);
    expect(!CommentCollection.get(13)).toBeTruthy();
    expect(UserCollection.get(10).comments.length).toEqual(0);
    OrganizationCollection.remove(14);
    expect(!OrganizationCollection.get(14)).toBeTruthy();
    expect(!UserCollection.get(10).organization).toBeTruthy();

    // organization15 relations
    expect(Array.isArray(OrganizationCollection.get(15).users)).toBeTruthy();
    UserCollection.remove(16);
    expect(!UserCollection.get(16)).toBeTruthy();
    expect(OrganizationCollection.get(15).users.length).toEqual(2);
    UserCollection.remove(17);
    expect(!UserCollection.get(17)).toBeTruthy();
    expect(OrganizationCollection.get(15).users.length).toEqual(1);
    UserCollection.remove(18);
    expect(!UserCollection.get(18)).toBeTruthy();
    expect(OrganizationCollection.get(15).users.length).toEqual(0);

    // comment19 relations
    expect(UserCollection.get(20)).toEqual(CommentCollection.get(19).user);
    expect(UserCollection.get(19)).toEqual(CommentCollection.get(19).approvedByUser);
    UserCollection.remove(20);
    expect(!CommentCollection.get(19).user).toBeTruthy();
    UserCollection.remove(19);
    expect(!CommentCollection.get(19).approvedByUser).toBeTruthy();

    // profile21 relations
    expect(UserCollection.get(22)).toEqual(ProfileCollection.get(21).user);
    UserCollection.remove(22);
    expect(!ProfileCollection.get(21).user).toBeTruthy();
  });
  it('should emit change events', done => {
    const store = new JSData.DataStore();
    let handlersCalled = 0;
    store.defineMapper('foo', {
      type: 'object',
      schema: {
        properties: {
          bar: {type: 'string', track: true}
        }
      }
    });
    const foo = store.add('foo', {id: 1});
    expect(foo.bar).toEqual(undefined);

    store.on('change', (mapperName, record, changes) => {
      expect(mapperName).toEqual('foo');
      expect(record).toBe(foo);
      try {
        expect(changes).toEqual({added: {bar: 'baz'}, changed: {}, removed: {}});
      } catch (err) {
        expect(changes).toEqual({added: {}, changed: {bar: 'beep'}, removed: {}});
      }
      handlersCalled++;
    });

    store.getCollection('foo').on('change', (record, changes) => {
      expect(record).toBe(foo);
      try {
        expect(changes).toEqual({added: {bar: 'baz'}, changed: {}, removed: {}});
      } catch (err) {
        expect(changes).toEqual({added: {}, changed: {bar: 'beep'}, removed: {}});
      }
      handlersCalled++;
    });

    foo.on('change', (record, changes) => {
      expect(record).toBe(foo);
      try {
        expect(changes).toEqual({added: {bar: 'baz'}, changed: {}, removed: {}});
      } catch (err) {
        expect(changes).toEqual({added: {}, changed: {bar: 'beep'}, removed: {}});
      }
      handlersCalled++;
    });

    store.on('change:bar', (mapperName, record, value) => {
      expect(mapperName).toEqual('foo');
      expect(record).toBe(foo);
      expect(value === 'baz' || value === 'beep').toBeTruthy();
      handlersCalled++;
    });

    store.getCollection('foo').on('change:bar', (record, value) => {
      expect(record).toBe(foo);
      expect(value === 'baz' || value === 'beep').toBeTruthy();
      handlersCalled++;
    });

    foo.on('change:bar', (record, value) => {
      expect(record).toBe(foo);
      expect(value === 'baz' || value === 'beep').toBeTruthy();
      handlersCalled++;
    });

    // Modify the record directly
    foo.bar = 'baz';

    setTimeout(() => {
      if (handlersCalled !== 6) {
        done('not all handlers were called');
      } else {
        // Modify the record indirectly
        store.add('foo', {id: 1, bar: 'beep'});

        setTimeout(() => {
          if (handlersCalled !== 12) {
            done('not all handlers were called');
          } else {
            done();
          }
        }, 500);
      }
    }, 500);
  });
  it('should add relations', () => {
    const store = new JSData.DataStore();
    store.defineMapper('foo', {
      schema: {
        properties: {
          id: {type: 'number'}
        }
      },
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'foo_id'
          }
        }
      }
    });
    store.defineMapper('bar', {
      schema: {
        properties: {
          id: {type: 'number'},
          foo_id: {type: 'number'}
        }
      },
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'foo_id'
          }
        }
      }
    });
    const foo66 = store.add('foo', {
      id: 66,
      bars: [{id: 88}]
    });
    expect(foo66).toBe(store.get('foo', 66));
    expect(foo66.bars[0]).toBe(store.get('bar', 88));
    expect(foo66.bars[0].foo_id).toBe(66);

    const bar99 = store.add('bar', {
      id: 99,
      foo: {id: 101}
    });
    expect(bar99).toBe(store.get('bar', 99));
    expect(bar99.foo).toBe(store.get('foo', 101));
    expect(bar99.foo_id).toBe(101);

    const bar = store.add('bar', {
      foo: {}
    });
    expect(bar).toBe(store.unsaved('bar')[0]);
    expect(bar.foo).toBe(store.unsaved('foo')[0]);
    expect(bar.foo_id).toBe(undefined);

    let bar2 = store.add('bar', bar);
    expect(bar2).toBe(bar);
    let foo2 = store.add('foo', bar.foo);
    expect(foo2).toBe(bar.foo);
    expect(store.unsaved('bar').length).toEqual(1);
    expect(store.unsaved('foo').length).toEqual(1);

    store.prune('bar');
    store.prune('foo');

    const foo = store.add('foo', {
      bars: [{}]
    });
    expect(foo).toBe(store.unsaved('foo')[0]);
    expect(foo.bars[0]).toBe(store.unsaved('bar')[0]);
    expect(foo.bars[0].foo_id).toBe(undefined);

    foo2 = store.add('foo', foo);
    expect(foo2).toBe(foo);
    bar2 = store.add('bar', foo.bars[0]);
    expect(bar2).toBe(foo.bars[0]);
    expect(store.unsaved('bar').length).toEqual(1);
    expect(store.unsaved('foo').length).toEqual(1);
  });
  it('should correctly unlink inverse records', () => {
    const store = new JSData.DataStore();

    store.defineMapper('A', {
      idAttribute: 'uid',
      properties: {
        uid: {type: 'string'}
      },
      relations: {
        hasMany: {
          B: {
            localField: 'b',
            foreignKey: 'a_uid'
          }
        }
      }
    });

    store.defineMapper('B', {
      idAttribute: 'uid',
      properties: {
        uid: {type: 'string'},
        a_uid: {type: ['string', 'null']}
      },
      relations: {
        belongsTo: {
          A: {
            localField: 'a',
            foreignKey: 'a_uid'
          }
        }
      }
    });

    const aRecord = store.add('A', {uid: 'a1'});
    const bRecords = store.add('B', [
      {uid: 'b1', a_uid: 'a1'},
      {uid: 'b2', a_uid: 'a1'}
    ]);
    expect(aRecord.b).toEqual(bRecords);
    expect(bRecords[0].a).toBe(aRecord);
    expect(bRecords[1].a).toBe(aRecord);

    const aRecord2 = store.add('A', {uid: 'a2'});
    const bRecords2 = store.add('B', [
      {uid: 'b3', a_uid: 'a2'},
      {uid: 'b4', a_uid: 'a2'}
    ]);
    expect(aRecord2.b).toEqual(bRecords2);
    expect(bRecords2[0].a).toBe(aRecord2);
    expect(bRecords2[1].a).toBe(aRecord2);

    store.remove('B', 'b2');
    expect(aRecord.b).toEqual([bRecords[0]]);
    expect(bRecords[0].a).toBe(aRecord);
    expect(bRecords[1].a).toBe(undefined);

    store.remove('A', 'a2');
    expect(aRecord2.b).toEqual([]);
    expect(bRecords2[0].a).toEqual(undefined);
    expect(bRecords2[1].a).toEqual(undefined);
  });
  it('should add property accessors to prototype of target and allow relation re-assignment using defaults', () => {
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
    const foo = store.add('foo', {id: 1});
    const foo2 = store.add('foo', {id: 2});
    const bar = store.add('bar', {id: 1, fooId: 1});
    const bar2 = store.add('bar', {id: 2, fooId: 1});
    const bar3 = store.add('bar', {id: 3});
    expect(bar.foo).toBe(foo);
    expect(bar2.foo).toBe(foo);
    expect(!bar3.foo).toBeTruthy();
    bar.foo = foo2;
    bar3.foo = foo;
    expect(bar.foo).toBe(foo2);
    expect(bar2.foo).toBe(foo);
    expect(bar3.foo).toBe(foo);
  });

  it('should not create an inverseLink if no inverseRelationship is defined', () => {
    const store = new JSData.DataStore();
    store.defineMapper('foo', {});
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: '_foo',
            foreignKey: 'foo_id'
          }
        }
      }
    });
    const foo = store.add('foo', {id: 1});
    const bar = store.add('bar', {id: 1, foo_id: 1});
    expect(bar._foo).toBe(foo);
  });

  it('should add property accessors to prototype of target and allow relation re-assignment using customizations', () => {
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
            localField: '_foo',
            foreignKey: 'fooId'
          }
        }
      }
    });
    const foo = store.add('foo', {id: 1});
    const foo2 = store.add('foo', {id: 2});
    const bar = store.add('bar', {id: 1, fooId: 1});
    const bar2 = store.add('bar', {id: 2, fooId: 1});
    const bar3 = store.add('bar', {id: 3});
    expect(bar._foo).toBe(foo);
    expect(bar2._foo).toBe(foo);
    expect(!bar3._foo).toBeTruthy();
    bar._foo = foo2;
    bar3._foo = foo;
    expect(bar._foo).toBe(foo2);
    expect(bar2._foo).toBe(foo);
    expect(bar3._foo).toBe(foo);
  });
  it('should allow custom getter and setter', () => {
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
            localField: '_foo',
            foreignKey: 'fooId',
            get: (Relation, bar, originalGet) => {
              getCalled++;
              return originalGet();
            },
            set: (Relation, bar, foo, originalSet) => {
              setCalled++;
              originalSet();
            }
          }
        }
      }
    });
    let getCalled = 0;
    let setCalled = 0;
    const foo = store.add('foo', {id: 1});
    const foo2 = store.add('foo', {id: 2});
    const bar = store.add('bar', {id: 1, fooId: 1});
    const bar2 = store.add('bar', {id: 2, fooId: 1});
    const bar3 = store.add('bar', {id: 3});
    expect(bar._foo).toBe(foo);
    expect(bar2._foo).toBe(foo);
    expect(!bar3._foo).toBeTruthy();
    bar._foo = foo2;
    bar3._foo = foo;
    expect(bar._foo).toBe(foo2);
    expect(bar2._foo).toBe(foo);
    expect(bar3._foo).toBe(foo);
    expect(getCalled).toEqual(11);
    expect(setCalled).toEqual(4);
  });
  it('supports tree-like relations', () => {
    const store = new JSData.DataStore();

    store.defineMapper('node', {
      relations: {
        belongsTo: {
          node: {
            localField: 'parent',
            foreignKey: 'parentId'
          }
        },
        hasMany: {
          node: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        }
      }
    });

    const nodes = store.add('node', [
      {
        id: 0,
        name: 'A',
        parentId: null
      },
      {
        id: 1,
        name: 'B',
        parentId: null
      },
      {
        id: 2,
        name: 'A.1',
        parentId: 0
      },
      {
        id: 3,
        name: 'A.2',
        parentId: 0
      },
      {
        id: 4,
        name: 'A.2.a',
        parentId: 3
      }
    ]);

    expect(nodes[0].parent).toBeFalsy();
    expect(nodes[0].children).toEqual([nodes[2], nodes[3]]);

    expect(nodes[1].parent).toBeFalsy();
    expect(nodes[1].children).toEqual([]);

    expect(nodes[2].parent).toBe(nodes[0]);
    expect(nodes[2].children).toEqual([]);

    expect(nodes[3].parent).toEqual(nodes[0]);
    expect(nodes[3].children).toEqual([nodes[4]]);

    expect(nodes[4].parent).toEqual(nodes[3]);
    expect(nodes[4].children).toEqual([]);
  });

  it('should find hasMany foreignKeys with custom idAttribute', () => {
    const store = new JSData.DataStore();

    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            localKeys: 'barIds'
          }
        }
      },
      idAttribute: 'fooId'
    });
    store.defineMapper('bar', {
      relations: {
        hasMany: {
          foo: {
            localField: 'foos',
            foreignKeys: 'barIds'
          }
        }
      }
    });

    const bars = store.add('bar', [
      {
        id: 0,
        name: 'A'
      },
      {
        id: 1,
        name: 'B'
      },
      {
        id: 2,
        name: 'C'
      }
    ]);

    const foo = store.add('foo', {
      fooId: 9,
      name: 'Z',
      barIds: [0, 2]
    });

    expect(foo.bars).toBeTruthy();
    expect(foo.bars).toEqual([bars[0], bars[2]]);
  });
});
