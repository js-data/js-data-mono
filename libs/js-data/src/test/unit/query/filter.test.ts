import { data, JSData, PostCollection, store } from '../../_setup';
import { QueryDefinition } from '../../../lib/Query';

describe('Query#filter', () => {
  it('should work', function () {
    const collection = PostCollection;
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    const p5 = data.p5;

    p1.roles = ['admin'];
    p2.roles = ['admin', 'dev'];
    p3.roles = ['admin', 'dev'];
    p4.roles = [];
    p5.roles = ['admin', 'dev', 'owner'];

    store.add('post', [p1, p2, p3, p4, p5]);

    let params: QueryDefinition = {
      author: 'John'
    };

    expect(collection.query().filter(params).run()).toEqual([p1]);

    params = {
      author: 'Adam',
      id: 9
    };

    expect(collection.query().filter(params).run()).toEqual([p5]);

    params = {
      where: {
        author: 'John'
      }
    };

    expect(collection.query().filter(params).run()).toEqual([p1]);

    params.where.author = {
      '==': 'John'
    };

    expect(collection.query().filter(params).run()).toEqual([p1]);

    params.where.author = {
      '===': null
    };

    expect(collection.query().filter(params).run()).toEqual([]);

    params.where.author = {
      '!=': 'John'
    };

    expect(collection.query().filter(params).run()).toEqual([p2, p3, p4, p5]);

    params.where = {
      age: {
        '>': 31
      }
    };

    expect(collection.query().filter(params).run()).toEqual([p3, p4, p5]);

    params.where = {
      age: {
        '>=': 31
      }
    };

    expect(collection.query().filter(params).run()).toEqual([p2, p3, p4, p5]);

    params.where = {
      age: {
        '<': 31
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1]);

    params.where = {
      age: {
        '>': 30,
        '<': 33
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p2, p3]);

    params.where = {
      age: {
        '|>': 30,
        '|<': 33
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p4, p5]);

    params.where = {
      age: {
        '|<=': 31
      },
      author: {
        '|==': 'Adam'
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p4, p5]);

    params.where = {
      age: {
        '<=': 31
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2]);

    params.where = {
      age: {
        in: [30, 33]
      },
      author: {
        in: ['John', 'Sally', 'Adam']
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p4, p5]);

    params.where = {
      author: {
        in: 'John'
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1]);

    params.where = {
      author: {
        notIn: 'John'
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p2, p3, p4, p5]);

    params.where = {
      age: {
        '|in': [31]
      },
      id: {
        '|in': [8]
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p2, p4]);

    params.where = {
      id: {
        notIn: [8]
      }
    };

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p5]);

    params.where = {age: {garbage: 'should have no effect'}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p4, p5]);

    params.where = {author: {like: 'Ada%'}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p4, p5]);

    params.where = {author: {like: '%a%'}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p2, p4, p5]);

    params.where = {author: {notLike: 'Ada%'}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3]);

    params.where = {roles: {isectEmpty: ['admin']}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p4]);

    params.where = {roles: {isectNotEmpty: ['admin']}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p5]);

    params.where = {roles: {notContains: 'admin'}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p4]);

    params.where = {age: {'!==': 33}};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3]);

    params = undefined;

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p4, p5]);

    params = {offset: 4};

    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p5]);

    params = {
      where: [
        {
          roles: {
            contains: 'admin'
          }
        },
        'or',
        {
          age: {
            '=': 30
          }
        }
      ]
    };
    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p2, p3, p5]);

    params = {
      where: [
        {
          roles: {
            contains: 'admin'
          },
          age: {
            '=': 30
          }
        },
        'or',
        {
          roles: {
            contains: 'owner'
          }
        }
      ]
    };
    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p5]);

    params = {
      where: [
        [
          {
            roles: {
              contains: 'admin'
            },
            age: {
              '=': 30
            }
          },
          'or',
          {
            author: {
              '=': 'Mike'
            }
          }
        ],
        'or',
        {
          roles: {
            contains: 'owner'
          },
          age: {
            '=': 33
          }
        }
      ]
    };
    expect(collection
      .query()
      .filter(params)
      .run()).toEqual([p1, p3, p5]);
  });
  it('should allow custom filter function', function () {
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    store.add('post', [p1, p2, p3, p4]);

    expect(store
      .query('post')
      .filter(item => {
        return item.author === 'John' || item.age % 30 === 1;
      })
      .run()).toEqual([p1, p2]);
  });
  it('should filter by nested keys', () => {
    const store = new JSData.DataStore();
    store.defineMapper('thing');
    const things = [
      {
        id: 1,
        foo: {
          bar: 1
        }
      },
      {
        id: 2,
        foo: {
          bar: 2
        }
      },
      {
        id: 3,
        foo: {
          bar: 3
        }
      },
      {
        id: 4,
        foo: {
          bar: 4
        }
      }
    ];

    store.add('thing', things);

    const params = {
      where: {
        'foo.bar': {
          '>': 2
        }
      }
    };

    expect(store
      .query('thing')
      .filter(params)
      .run()).toEqual([things[2], things[3]]);
  });
  it('should support the "like" operator', function () {
    const users = [
      {id: 1, name: 'foo'},
      {id: 2, name: 'xfoo'},
      {id: 3, name: 'foox'},
      {id: 4, name: 'xxfoo'},
      {id: 5, name: 'fooxx'},
      {id: 6, name: 'xxfooxx'},
      {id: 7, name: 'xxfooxxfooxx'},
      {id: 8, name: 'fooxxfoo'},
      {id: 9, name: 'fooxfoo'},
      {id: 10, name: 'fooxxfoox'}
    ];
    store.add('user', users);

    expect(store
      .query('user')
      .filter({where: {name: {like: 'foo'}}})
      .run()).toEqual([users[0]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: '_foo'}}})
      .run()).toEqual([users[1]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: 'foo_'}}})
      .run()).toEqual([users[2]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: '%foo'}}})
      .run()).toEqual([users[0], users[1], users[3], users[7], users[8]]);
    expect(store
      .query('user')
      .filter({where: {name: {likei: 'FOO%'}}})
      .run()).toEqual([users[0], users[2], users[4], users[7], users[8], users[9]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: '%foo%'}}})
      .run()).toEqual(users);
    expect(store
      .query('user')
      .filter({where: {name: {like: '%foo%foo%'}}})
      .run()).toEqual([users[6], users[7], users[8], users[9]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: 'foo%foo'}}})
      .run()).toEqual([users[7], users[8]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: 'foo_foo'}}})
      .run()).toEqual([users[8]]);
    expect(store
      .query('user')
      .filter({where: {name: {like: 'foo%foo_'}}})
      .run()).toEqual([users[9]]);

    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo'}}})
      .run()).toEqual(
      [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]]
    );
    expect(store
      .query('user')
      .filter({where: {name: {notLike: '_foo'}}})
      .run()).toEqual(
      [users[0], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]]
    );
    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo_'}}})
      .run()).toEqual(
      [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[8], users[9]]
    );
    expect(store
      .query('user')
      .filter({where: {name: {notLike: '%foo'}}})
      .run()).toEqual([users[2], users[4], users[5], users[6], users[9]]);
    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo%'}}})
      .run()).toEqual([users[1], users[3], users[5], users[6]]);
    expect(store
      .query('user')
      .filter({where: {name: {notLike: '%foo%'}}})
      .run()).toEqual([]);
    expect(store
      .query('user')
      .filter({where: {name: {notLike: '%foo%foo%'}}})
      .run()).toEqual([users[0], users[1], users[2], users[3], users[4], users[5]]);
    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo%foo'}}})
      .run()).toEqual(
      [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[9]]
    );
    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo_foo'}}})
      .run()).toEqual(
      [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[9]]
    );
    expect(store
      .query('user')
      .filter({where: {name: {notLike: 'foo%foo_'}}})
      .run()).toEqual(
      [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]]
    );
  });
});
